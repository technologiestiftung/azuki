import { describe, expect, it, vi } from "vitest";

async function loadApp(appPassword: string) {
	vi.resetModules();
	vi.stubEnv("APP_PASSWORD", appPassword);
	const { default: app } = await import("../src/app.js");
	return app;
}

describe("public app routes are usable without x-app-password", () => {
	it("POST /api/match", async () => {
		const app = await loadApp("secret");
		const res = await app.request("/api/match", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({}),
		});
		expect(res.status).not.toBe(401);
	});

	it("POST /api/vacancies", async () => {
		const app = await loadApp("secret");
		const res = await app.request("/api/vacancies", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({}),
		});
		expect(res.status).not.toBe(401);
	});

	it("POST /api/reverse-geocode", async () => {
		const app = await loadApp("secret");
		const res = await app.request("/api/reverse-geocode", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({}),
		});
		expect(res.status).not.toBe(401);
	});

	it("POST /api/contact", async () => {
		const app = await loadApp("secret");
		const res = await app.request("/api/contact", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({}),
		});
		expect(res.status).not.toBe(401);
	});

	it("POST /api/occupations/:id/match-explanations", async () => {
		const app = await loadApp("secret");
		const res = await app.request(
			"/api/occupations/999999999/match-explanations",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({}),
			},
		);
		expect(res.status).not.toBe(401);
	});

	it("POST /api/profile/short-description", async () => {
		const app = await loadApp("secret");
		const res = await app.request("/api/profile/short-description", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({}),
		});
		expect(res.status).not.toBe(401);
	});
});

describe("admin routes still require x-app-password", () => {
	it("rejects GET /api/eval/default-prompt without the header", async () => {
		const app = await loadApp("secret");
		const res = await app.request("/api/eval/default-prompt");
		expect(res.status).toBe(401);
	});

	it("accepts GET /api/eval/default-prompt with the correct header", async () => {
		const app = await loadApp("secret");
		const res = await app.request("/api/eval/default-prompt", {
			headers: { "x-app-password": "secret" },
		});
		expect(res.status).toBe(200);
	});

	it("rejects POST /api/eval/run without the header", async () => {
		const app = await loadApp("secret");
		const res = await app.request("/api/eval/run", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({}),
		});
		expect(res.status).toBe(401);
	});

	it("rejects GET /api/personas without the header", async () => {
		const app = await loadApp("secret");
		const res = await app.request("/api/personas");
		expect(res.status).toBe(401);
	});
});
