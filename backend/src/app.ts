import { Hono, type Context } from "hono";
import { cors } from "hono/cors";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { Beruf, UserProfile, MatchResult } from "./types.js";
import { grobFilter } from "./matching/index.js";
import { mistralRank } from "./mistral/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = resolve(__dirname, "../data/berufe.json");

let berufe: Beruf[] = [];
if (existsSync(dataPath)) {
	berufe = JSON.parse(readFileSync(dataPath, "utf-8"));
	console.log(`Loaded ${berufe.length} Berufe from cache.`);
} else {
	console.warn(`No berufe.json found at ${dataPath}. Run fetch-berufe first.`);
}

const app = new Hono();

app.use("/*", cors());

app.get("/api/health", (c) =>
	c.json({ ok: true, berufeCount: berufe.length }),
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

	const profile = (await c.req.json()) as UserProfile;

	const top40 = grobFilter(berufe, profile, 40);

	try {
		const result = await mistralRank(top40, profile);
		return c.json(result);
	} catch (err) {
		console.error("Mistral error, falling back to grob-filter:", err);
		const fallback: MatchResult = {
			berufe: top40.slice(0, 8).map((s) => ({
				id: s.beruf.id,
				name: s.beruf.name,
				score: s.score,
				bilder: s.beruf.bilder.slice(0, 3),
				aufgabenKompakt: s.beruf.aufgabenKompakt || "",
				begruendung: "Dieser Beruf passt zu deinem Profil.",
			})),
		};
		return c.json(fallback);
	}
});

app.get("/api/berufe/:id", (c) => {
	const id = parseInt(c.req.param("id"), 10);
	const beruf = berufe.find((b) => b.id === id);
	if (!beruf) return c.json({ error: "Beruf nicht gefunden" }, 404);
	return c.json(beruf);
});

export default app;
