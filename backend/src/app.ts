import { Hono, type Context } from "hono";
import { cors } from "hono/cors";
import { UserProfileSchema } from "./schemas/userProfile.js";
import type { Occupation, MatchResult } from "@azuki/shared";
import { preFilter } from "./matching/index.js";
import { mistralRank } from "./mistral/index.js";
import occupationsData from "./data/berufe.json";

const occupations: Occupation[] = occupationsData as Occupation[];

const app = new Hono();

app.use("/*", cors());

app.get("/api/health", (c) =>
	c.json({ ok: true, occupationCount: occupations.length }),
);

function isAuthorized(c: Context): boolean {
	const appPassword = process.env.APP_PASSWORD;
	if (!appPassword) return true;
	const providedPassword = c.req.header("x-app-password");
	return Boolean(providedPassword && providedPassword === appPassword);
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

	const top40 = preFilter(occupations, profile, 40);

	try {
		const result = await mistralRank(top40, profile);
		return c.json(result);
	} catch (err) {
		console.error("Mistral error, falling back to pre-filter:", err);
		const fallback: MatchResult = {
			occupations: top40.slice(0, 8).map((scored) => ({
				id: scored.occupation.id,
				name: scored.occupation.name,
				score: scored.score,
				images: scored.occupation.images.slice(0, 3),
				taskSummary: scored.occupation.taskSummary || "",
				reasoning: "Dieser Beruf passt zu deinem Profil.",
			})),
		};
		return c.json(fallback);
	}
});

app.get("/api/occupations/:id", (c) => {
	const id = parseInt(c.req.param("id"), 10);
	const occupation = occupations.find((o) => o.id === id);
	if (!occupation) return c.json({ error: "Occupation not found" }, 404);
	return c.json(occupation);
});

export default app;
