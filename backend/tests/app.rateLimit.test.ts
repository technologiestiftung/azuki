import { describe, expect, it, vi } from "vitest";

async function loadApp() {
	vi.resetModules();
	const { default: app } = await import("../src/app.js");
	return app;
}

async function postContact(
	app: Awaited<ReturnType<typeof loadApp>>,
	ip: string,
) {
	return app.request("/api/contact", {
		method: "POST",
		headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
		body: JSON.stringify({}),
	});
}

async function postReverseGeocode(
	app: Awaited<ReturnType<typeof loadApp>>,
	ip: string,
) {
	return app.request("/api/reverse-geocode", {
		method: "POST",
		headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
		body: JSON.stringify({}),
	});
}

async function postContactNoIp(app: Awaited<ReturnType<typeof loadApp>>) {
	return app.request("/api/contact", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({}),
	});
}

async function postReverseGeocodeNoIp(
	app: Awaited<ReturnType<typeof loadApp>>,
) {
	return app.request("/api/reverse-geocode", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({}),
	});
}

describe("/api/contact rate limiting", () => {
	it("returns 429 once the per-IP limit is exceeded", async () => {
		const app = await loadApp();
		const statuses: number[] = [];
		for (let i = 0; i < 201; i++) {
			const res = await postContact(app, "1.2.3.4");
			statuses.push(res.status);
		}
		expect(statuses.slice(0, 200)).not.toContain(429);
		expect(statuses[200]).toBe(429);
	});

	it("tracks different IPs independently", async () => {
		const app = await loadApp();
		for (let i = 0; i < 200; i++) {
			await postContact(app, "1.2.3.4");
		}
		const blocked = await postContact(app, "1.2.3.4");
		expect(blocked.status).toBe(429);

		const otherIp = await postContact(app, "9.9.9.9");
		expect(otherIp.status).not.toBe(429);
	});
});

describe("/api/reverse-geocode rate limiting", () => {
	it("returns 429 once the per-IP limit is exceeded", async () => {
		const app = await loadApp();
		const statuses: number[] = [];
		for (let i = 0; i < 201; i++) {
			const res = await postReverseGeocode(app, "5.5.5.5");
			statuses.push(res.status);
		}
		expect(statuses.slice(0, 200)).not.toContain(429);
		expect(statuses[200]).toBe(429);
	});

	it("has a limit independent of /api/contact's", async () => {
		const app = await loadApp();
		for (let i = 0; i < 200; i++) {
			await postContact(app, "7.7.7.7");
		}
		const contactBlocked = await postContact(app, "7.7.7.7");
		expect(contactBlocked.status).toBe(429);

		const geocode = await postReverseGeocode(app, "7.7.7.7");
		expect(geocode.status).not.toBe(429);
	});
});

describe("rate limiting fails open with no determinable client identity", () => {
	it("never 429s /api/contact when no ip header is present", async () => {
		const app = await loadApp();
		for (let i = 0; i < 210; i++) {
			const res = await postContactNoIp(app);
			expect(res.status).not.toBe(429);
		}
	});

	it("never 429s /api/reverse-geocode when no ip header is present", async () => {
		const app = await loadApp();
		for (let i = 0; i < 210; i++) {
			const res = await postReverseGeocodeNoIp(app);
			expect(res.status).not.toBe(429);
		}
	});
});
