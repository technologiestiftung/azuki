import { Hono, type Context } from "hono";
import { cors } from "hono/cors";
import { UserProfileSchema } from "./schemas/userProfile.js";
import { ContactRequestSchema } from "./schemas/contact.js";
import { submitContactToHubSpot } from "./hubspot/client.js";
import {
	type Occupation,
	type MatchResult,
	type VacanciesResponse,
	formatOccupationDisplayName,
	AI_MODEL_IDS,
	parseSharedOccupationsParam,
	scoreFromFitPercent,
	resolveOccupationShortDescription,
} from "@azuki/shared";
import { occupationMatchMeta } from "./occupationMeta";
import {
	pickWildcardOccupations,
	toWildcardMatchedOccupation,
} from "./wildcards.js";
import {
	FINAL_MATCH_COUNT,
	preFilter,
	PREFILTER_TOP_K,
} from "./matching/index.js";
import { aiRank, withFitPercentages, buildSystemPromptV5 } from "./ai/index.js";
import occupationsData from "./data/berufe.json";
import { VacanciesRequestSchema } from "./schemas/vacancies.js";
import { ReverseGeocodeRequestSchema } from "./schemas/reverseGeocode.js";
import { searchVacancies, getJobDetails } from "./jobsuche/client.js";
import {
	mergeVacancyOccupationNames,
	resolvePreferredJobVacancyNames,
} from "./matching/resolvePreferredJobs.js";
import { resolveLocationFromCoordinates } from "./nominatim/client.js";
import { runEval } from "../eval/run.js";
import { z } from "zod";
import { getSupabase } from "./supabase.js";
import { slugify } from "./personas/slugify.js";
import {
	CreatePersonaSchema,
	UpdatePersonaSchema,
} from "./personas/schemas.js";
import { rowToPersona, type PersonaInsertRow } from "./personas/mappers.js";
import { renderOccupationPreviewPage } from "./occupationPreviewPage.js";

const occupations: Occupation[] = occupationsData as Occupation[];

// Real defense for the admin surface is APP_PASSWORD, not CORS:
// auth is via the `x-app-password` request header (never auto-sent by
// browsers), so a strict CORS allowlist provides little uplift in this
// model. If/when this migrates to cookie-based auth, revisit and lock
// CORS down by origin.
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const APP_PASSWORD = process.env.APP_PASSWORD;

if (IS_PRODUCTION && !APP_PASSWORD) {
	throw new Error(
		"APP_PASSWORD must be set in production. Refusing to start with an unauthenticated admin surface.",
	);
}
if (!APP_PASSWORD) {
	console.warn(
		"[security] APP_PASSWORD is not set — admin routes are unauthenticated. Set it for any non-local environment.",
	);
}

const app = new Hono();

app.use(
	"/*",
	cors({
		origin: "*",
		allowHeaders: ["Content-Type", "x-app-password"],
		allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	}),
);

const EvalRunRequestSchema = z.object({
	systemPrompt: z.string().min(1),
	model: z.string().min(1),
	personaIds: z.array(z.string().min(1)).min(1),
});

app.get("/api/health", (c) =>
	c.json({ ok: true, occupationCount: occupations.length }),
);

/** Same-origin proxy for Berufepool images (no CORS on the upstream host). */
const IMAGE_PROXY_HOST = "rest.arbeitsagentur.de";
const IMAGE_PROXY_PATH_PREFIX = "/infosysbub/berufepool-rest/";

app.get("/api/image-proxy", async (c) => {
	const rawUrl = c.req.query("url");
	if (!rawUrl) {
		return c.json({ error: "Missing url" }, 400);
	}
	let target: URL;
	try {
		target = new URL(rawUrl);
	} catch {
		return c.json({ error: "Invalid url" }, 400);
	}
	if (
		target.protocol !== "https:" ||
		target.hostname !== IMAGE_PROXY_HOST ||
		!target.pathname.startsWith(IMAGE_PROXY_PATH_PREFIX)
	) {
		return c.json({ error: "URL not allowed" }, 400);
	}
	try {
		const upstream = await fetch(target.toString(), {
			redirect: "error",
			headers: {
				Accept: "image/*,*/*;q=0.8",
				"User-Agent": "AzukiImageProxy/1.0",
			},
			signal: AbortSignal.timeout(15000),
		});
		if (!upstream.ok) {
			return c.json({ error: "Upstream fetch failed" }, 502);
		}
		const contentType = upstream.headers.get("content-type") || "image/jpeg";
		const body = await upstream.arrayBuffer();
		return new Response(body, {
			status: 200,
			headers: {
				"Content-Type": contentType,
				"Cache-Control": "public, max-age=86400",
			},
		});
	} catch {
		return c.json({ error: "Upstream fetch failed" }, 502);
	}
});

function isAuthorized(c: Context): boolean {
	if (!APP_PASSWORD) {
		// Reachable only in non-production (prod startup throws above).
		return !IS_PRODUCTION;
	}
	const provided = c.req.header("x-app-password");
	return provided === APP_PASSWORD;
}

async function generateUniqueSlug(name: string): Promise<string> {
	const base = slugify(name) || "persona";
	const reserved = new Set(["nico", "elina", "karim"]);
	const supabase = getSupabase();
	const { data: existing } = await supabase
		.from("personas")
		.select("id")
		.eq("id", base)
		.maybeSingle();
	if (!existing && !reserved.has(base)) {
		return base;
	}
	const stamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "");
	return `${base}-${stamp.slice(0, 12)}`;
}

app.post("/api/unlock", (c) => {
	if (!isAuthorized(c)) {
		return c.json({ error: "Unauthorized" }, 401);
	}
	return c.json({ ok: true });
});

app.post("/api/match", async (c) => {
	let body: unknown;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ error: "Invalid request body" }, 400);
	}

	const parsedProfile = UserProfileSchema.safeParse(body);
	if (!parsedProfile.success) {
		return c.json({ error: "Invalid request body" }, 400);
	}
	const profile = parsedProfile.data;

	let topCandidates: ReturnType<typeof preFilter> = [];
	try {
		topCandidates = preFilter(occupations, profile, PREFILTER_TOP_K);
		const result = await aiRank(topCandidates, profile);
		const wildcardOccupations = pickWildcardOccupations(
			occupations,
			new Set(result.occupations.map((o) => o.id)),
		).map(toWildcardMatchedOccupation);
		return c.json({ ...result, wildcardOccupations });
	} catch (err) {
		console.error("Match error, falling back to pre-filter:", err);
		if (topCandidates.length === 0) {
			try {
				topCandidates = preFilter(occupations, profile, PREFILTER_TOP_K);
			} catch (preErr) {
				console.error("Pre-filter failed during fallback:", preErr);
				topCandidates = occupations
					.slice(0, PREFILTER_TOP_K)
					.map((occupation) => ({
						occupation,
						score: 0,
					}));
			}
		}
		const matchedOccupations = topCandidates
			.slice(0, FINAL_MATCH_COUNT)
			.map((scored) => ({
				id: scored.occupation.id,
				name: formatOccupationDisplayName(scored.occupation.name),
				rawName: scored.occupation.name,
				score: scored.score,
				images: scored.occupation.images.slice(0, 3),
				shortDescription: resolveOccupationShortDescription(scored.occupation),
				reasoning: "Dieser Beruf passt zu deinem Profil.",
				salaryKnown: scored.occupation.salaryKnown,
				salaryMonthlyMedian: scored.occupation.salaryMonthlyMedian,
				salaryEntryKnown: scored.occupation.salaryEntryKnown,
				salaryMonthlyEntry: scored.occupation.salaryMonthlyEntry,
				...occupationMatchMeta(scored.occupation),
			}));
		const fallback: MatchResult = {
			occupations: withFitPercentages(matchedOccupations),
			wildcardOccupations: pickWildcardOccupations(
				occupations,
				new Set(matchedOccupations.map((o) => o.id)),
			).map(toWildcardMatchedOccupation),
		};
		return c.json(fallback);
	}
});

app.post("/api/vacancies", async (c) => {
	let body: unknown;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ error: "Invalid request body" }, 400);
	}

	const parsed = VacanciesRequestSchema.safeParse(body);
	if (!parsed.success) {
		return c.json({ error: "Invalid request body" }, 400);
	}

	const {
		postcode,
		occupations: occupationNames,
		wildcardOccupations: wildcardOccupationNames,
		preferredJobs,
		distance,
	} = parsed.data;

	const preferredOccupationNames = resolvePreferredJobVacancyNames(
		preferredJobs,
		occupations,
	);
	const mergedOccupationNames = mergeVacancyOccupationNames(
		preferredOccupationNames,
		occupationNames,
		wildcardOccupationNames,
	);

	const results = await Promise.all(
		mergedOccupationNames.map((occupationName) =>
			searchVacancies(occupationName, postcode, distance),
		),
	);

	const response: VacanciesResponse = { results };
	return c.json(response);
});

app.get("/api/shared-match", (c) => {
	const occupationsParam = c.req.query("o") ?? "";
	const entries = parseSharedOccupationsParam(occupationsParam);
	if (entries.length === 0) {
		return c.json({ error: "Invalid or empty occupations parameter" }, 400);
	}

	const occupationById = new Map(occupations.map((entry) => [entry.id, entry]));
	const matched = entries.flatMap(({ id, fit }) => {
		const occupation = occupationById.get(id);
		if (!occupation) {
			return [];
		}
		return [
			{
				id: occupation.id,
				name: formatOccupationDisplayName(occupation.name),
				rawName: occupation.name,
				score: scoreFromFitPercent(fit),
				fitPercent: fit,
				images: occupation.images.slice(0, 3),
				shortDescription: resolveOccupationShortDescription(occupation),
				reasoning: "",
				salaryKnown: occupation.salaryKnown,
				salaryMonthlyMedian: occupation.salaryMonthlyMedian,
				salaryEntryKnown: occupation.salaryEntryKnown,
				salaryMonthlyEntry: occupation.salaryMonthlyEntry,
				...occupationMatchMeta(occupation),
			},
		];
	});

	if (matched.length === 0) {
		return c.json({ error: "No matching occupations found" }, 404);
	}

	const result: MatchResult = {
		occupations: matched,
		wildcardOccupations: pickWildcardOccupations(
			occupations,
			new Set(matched.map((o) => o.id)),
		).map(toWildcardMatchedOccupation),
	};
	return c.json(result);
});

app.get("/api/shared-vacancies", async (c) => {
	const occupationsParam = c.req.query("o") ?? "";
	const entries = parseSharedOccupationsParam(occupationsParam);
	if (entries.length === 0) {
		return c.json({ error: "Invalid or empty occupations parameter" }, 400);
	}

	const postcodeMatch = /^\d{5}$/.exec(c.req.query("plz") ?? "10115");
	if (!postcodeMatch) {
		return c.json({ error: "Invalid postcode" }, 400);
	}
	const postcode = postcodeMatch[0];

	const distanceRaw = c.req.query("d");
	const distance = distanceRaw ? Number.parseInt(distanceRaw, 10) : 25;
	if (!Number.isFinite(distance) || distance < 2 || distance > 200) {
		return c.json({ error: "Invalid distance" }, 400);
	}

	const occupationById = new Map(occupations.map((entry) => [entry.id, entry]));
	const occupationNames = entries.flatMap(({ id }) => {
		const occupation = occupationById.get(id);
		return occupation ? [occupation.name] : [];
	});

	if (occupationNames.length === 0) {
		return c.json({ error: "No matching occupations found" }, 404);
	}

	const results = await Promise.all(
		occupationNames.map((occupationName) =>
			searchVacancies(occupationName, postcode, distance),
		),
	);

	const response: VacanciesResponse = { results };
	return c.json(response);
});

const REFERENZNUMMER_PATTERN = /^[A-Za-z0-9-]+$/;

app.get("/api/vacancies/:refnr", async (c) => {
	const refnr = c.req.param("refnr");
	if (!REFERENZNUMMER_PATTERN.test(refnr)) {
		return c.json({ error: "Invalid referenznummer" }, 400);
	}

	const detail = await getJobDetails(refnr);
	if (!detail) {
		return c.json({ error: "Vacancy not found" }, 404);
	}
	return c.json(detail);
});

app.post("/api/reverse-geocode", async (c) => {
	let body: unknown;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ error: "Invalid request body" }, 400);
	}

	const parsed = ReverseGeocodeRequestSchema.safeParse(body);
	if (!parsed.success) {
		return c.json({ error: "Invalid request body" }, 400);
	}

	const location = await resolveLocationFromCoordinates(
		parsed.data.latitude,
		parsed.data.longitude,
	);
	if (!location) {
		return c.json({ error: "No location found" }, 404);
	}

	return c.json(location);
});

app.post("/api/contact", async (c) => {
	let body: unknown;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ error: "Invalid request body" }, 400);
	}

	const parsed = ContactRequestSchema.safeParse(body);
	if (!parsed.success) {
		return c.json({ error: "Invalid request body" }, 400);
	}

	try {
		await submitContactToHubSpot(parsed.data);
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		console.error("HubSpot contact submission error:", msg);
		return c.json({ error: msg }, 502);
	}

	return c.json({ ok: true });
});

app.get("/api/occupations/:id", (c) => {
	const id = parseInt(c.req.param("id"), 10);
	const occupation = occupations.find((o) => o.id === id);
	if (!occupation) {
		return c.json({ error: "Occupation not found" }, 404);
	}
	return c.json(occupation);
});

app.get("/results/:id", (c) => renderOccupationPreviewPage(c, occupations));
app.get("/api/results/:id", (c) => renderOccupationPreviewPage(c, occupations));

const MatchExplanationsRequestSchema = z.object({
	profile: z.unknown(),
});

app.post("/api/occupations/:id/match-explanations", async (c) => {
	const id = parseInt(c.req.param("id"), 10);
	const occupation = occupations.find((o) => o.id === id);
	if (!occupation) {
		return c.json({ error: "Occupation not found" }, 404);
	}

	let body: unknown;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ error: "Invalid request body" }, 400);
	}

	const parsed = MatchExplanationsRequestSchema.safeParse(body);
	if (!parsed.success) {
		return c.json({ error: "Invalid request body" }, 400);
	}

	const parsedProfile = UserProfileSchema.safeParse(parsed.data.profile);
	if (!parsedProfile.success) {
		return c.json({ error: "Invalid request body" }, 400);
	}

	try {
		const { generateMatchExplanations } = await import(
			"./ai/matchExplanations.js"
		);
		const result = await generateMatchExplanations(
			occupation,
			parsedProfile.data,
		);
		return c.json(result);
	} catch (err) {
		console.error("Match explanations error:", err);
		return c.json({ error: "Match explanations unavailable" }, 503);
	}
});

app.post("/api/profile/short-description", async (c) => {
	let body: unknown;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ error: "Invalid request body" }, 400);
	}

	const parsedProfile = UserProfileSchema.safeParse(body);
	if (!parsedProfile.success) {
		return c.json({ error: "Invalid request body" }, 400);
	}

	try {
		const { generateProfileShortDescription } = await import(
			"./ai/profileShortDescription.js"
		);
		const shortDescription = await generateProfileShortDescription(
			parsedProfile.data,
		);
		return c.json({ shortDescription });
	} catch (err) {
		console.error("Profile short description error:", err);
		return c.json({ error: "Profile short description unavailable" }, 503);
	}
});

app.get("/api/eval/default-prompt", (c) => {
	if (!isAuthorized(c)) {
		return c.json({ error: "Unauthorized" }, 401);
	}
	return c.json({ prompt: buildSystemPromptV5() });
});

app.post("/api/eval/run", async (c) => {
	if (!isAuthorized(c)) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	let body: unknown;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ error: "Invalid request body" }, 400);
	}

	const parsed = EvalRunRequestSchema.safeParse(body);
	if (!parsed.success) {
		return c.json({ error: "Invalid request body" }, 400);
	}
	const { systemPrompt, model, personaIds } = parsed.data;

	if (!AI_MODEL_IDS.has(model)) {
		return c.json({ error: "Invalid model" }, 400);
	}

	let personas;
	try {
		const supabase = getSupabase();
		const { data, error } = await supabase
			.from("personas")
			.select("*")
			.in("id", personaIds);
		if (error) {
			return c.json({ error: error.message }, 502);
		}
		personas = (data ?? []).map(rowToPersona);
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		return c.json({ error: msg }, 502);
	}

	const foundIds = new Set(personas.map((p) => p.id));
	const missing = personaIds.filter((id) => !foundIds.has(id));
	if (missing.length > 0) {
		return c.json({ error: "Persona(s) not found", missing }, 400);
	}

	const snapshot = await runEval({
		systemPrompt,
		model,
		occupations,
		personas,
	});
	return c.json(snapshot);
});

app.get("/api/personas", async (c) => {
	if (!isAuthorized(c)) {
		return c.json({ error: "Unauthorized" }, 401);
	}
	try {
		const supabase = getSupabase();
		const { data, error } = await supabase
			.from("personas")
			.select("*")
			.order("created_at", { ascending: true });
		if (error) {
			return c.json({ error: error.message }, 502);
		}
		return c.json((data ?? []).map(rowToPersona));
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		return c.json({ error: msg }, 502);
	}
});

app.get("/api/personas/:id", async (c) => {
	if (!isAuthorized(c)) {
		return c.json({ error: "Unauthorized" }, 401);
	}
	const id = c.req.param("id");
	try {
		const supabase = getSupabase();
		const { data, error } = await supabase
			.from("personas")
			.select("*")
			.eq("id", id)
			.maybeSingle();
		if (error) {
			return c.json({ error: error.message }, 502);
		}
		if (!data) {
			return c.json({ error: "Persona not found" }, 404);
		}
		return c.json(rowToPersona(data));
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		return c.json({ error: msg }, 502);
	}
});

app.post("/api/personas", async (c) => {
	if (!isAuthorized(c)) {
		return c.json({ error: "Unauthorized" }, 401);
	}
	let body: unknown;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ error: "Invalid request body" }, 400);
	}
	const parsed = CreatePersonaSchema.safeParse(body);
	if (!parsed.success) {
		return c.json(
			{ error: "Invalid request body", issues: parsed.error.issues },
			400,
		);
	}
	const input = parsed.data;
	const id = await generateUniqueSlug(input.name);
	const row: PersonaInsertRow = {
		id,
		name: input.name,
		description: input.description ?? null,
		profile: input.profile,
		tier_s: input.tierS,
		tier_a: input.tierA,
		tier_c: input.tierC,
	};
	try {
		const supabase = getSupabase();
		const { data, error } = await supabase
			.from("personas")
			.insert(row)
			.select("*")
			.single();
		if (error) {
			return c.json({ error: error.message }, 502);
		}
		return c.json(rowToPersona(data));
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		return c.json({ error: msg }, 502);
	}
});

app.put("/api/personas/:id", async (c) => {
	if (!isAuthorized(c)) {
		return c.json({ error: "Unauthorized" }, 401);
	}
	const id = c.req.param("id");
	let body: unknown;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ error: "Invalid request body" }, 400);
	}
	const parsed = UpdatePersonaSchema.safeParse(body);
	if (!parsed.success) {
		return c.json(
			{ error: "Invalid request body", issues: parsed.error.issues },
			400,
		);
	}
	const input = parsed.data;
	try {
		const supabase = getSupabase();
		const { data, error } = await supabase
			.from("personas")
			.update({
				name: input.name,
				description: input.description ?? null,
				profile: input.profile,
				tier_s: input.tierS,
				tier_a: input.tierA,
				tier_c: input.tierC,
			})
			.eq("id", id)
			.select("*")
			.maybeSingle();
		if (error) {
			return c.json({ error: error.message }, 502);
		}
		if (!data) {
			return c.json({ error: "Persona not found" }, 404);
		}
		return c.json(rowToPersona(data));
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		return c.json({ error: msg }, 502);
	}
});

app.delete("/api/personas/:id", async (c) => {
	if (!isAuthorized(c)) {
		return c.json({ error: "Unauthorized" }, 401);
	}
	const id = c.req.param("id");
	try {
		const supabase = getSupabase();
		const { error, count } = await supabase
			.from("personas")
			.delete({ count: "exact" })
			.eq("id", id);
		if (error) {
			return c.json({ error: error.message }, 502);
		}
		if (count === 0) {
			return c.json({ error: "Persona not found" }, 404);
		}
		return c.json({ ok: true });
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		return c.json({ error: msg }, 502);
	}
});

export default app;
