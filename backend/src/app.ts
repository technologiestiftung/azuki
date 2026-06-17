import { Hono, type Context } from "hono";
import { cors } from "hono/cors";
import { UserProfileSchema } from "./schemas/userProfile.js";
import {
	type Occupation,
	type MatchResult,
	type AusbildungsplaetzeResponse,
	formatOccupationDisplayName,
	AI_MODEL_IDS,
} from "@azuki/shared";
import { occupationMatchMeta } from "./occupationMeta";
import { preFilter, PREFILTER_TOP_K } from "./matching/index.js";
import { resolveOccupationShortDescription } from "@azuki/shared";
import { aiRank, buildSystemPrompt } from "./ai/index.js";
import occupationsData from "./data/berufe.json";
import { AusbildungsplaetzeRequestSchema } from "./schemas/ausbildungsplaetze.js";
import { ReverseGeocodeRequestSchema } from "./schemas/reverseGeocode.js";
import { searchAusbildungsplaetze } from "./jobsuche/client.js";
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
	if (!isAuthorized(c)) {
		return c.json({ error: "Unauthorized" }, 401);
	}

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
		return c.json(result);
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
		const fallback: MatchResult = {
			occupations: topCandidates.slice(0, 8).map((scored) => ({
				id: scored.occupation.id,
				name: formatOccupationDisplayName(scored.occupation.name),
				rawName: scored.occupation.name,
				score: scored.score,
				images: scored.occupation.images.slice(0, 3),
				shortDescription: resolveOccupationShortDescription(scored.occupation),
				reasoning: "Dieser Beruf passt zu deinem Profil.",
				...occupationMatchMeta(scored.occupation),
			})),
		};
		return c.json(fallback);
	}
});

app.post("/api/ausbildungsplaetze", async (c) => {
	if (!isAuthorized(c)) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	let body: unknown;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ error: "Invalid request body" }, 400);
	}

	const parsed = AusbildungsplaetzeRequestSchema.safeParse(body);
	if (!parsed.success) {
		return c.json({ error: "Invalid request body" }, 400);
	}

	const { postcode, occupations: occupationNames, distance } = parsed.data;

	const results = await Promise.all(
		occupationNames.map((occupationName) =>
			searchAusbildungsplaetze(occupationName, postcode, distance),
		),
	);

	const response: AusbildungsplaetzeResponse = { results };
	return c.json(response);
});

app.post("/api/reverse-geocode", async (c) => {
	if (!isAuthorized(c)) {
		return c.json({ error: "Unauthorized" }, 401);
	}

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

app.get("/api/occupations/:id", (c) => {
	const id = parseInt(c.req.param("id"), 10);
	const occupation = occupations.find((o) => o.id === id);
	if (!occupation) {
		return c.json({ error: "Occupation not found" }, 404);
	}
	return c.json(occupation);
});

app.get("/api/eval/default-prompt", (c) => {
	if (!isAuthorized(c)) {
		return c.json({ error: "Unauthorized" }, 401);
	}
	return c.json({ prompt: buildSystemPrompt() });
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
