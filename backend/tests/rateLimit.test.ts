import { describe, expect, it } from "vitest";
import { createRateLimiter } from "../src/rateLimit.js";

describe("createRateLimiter", () => {
	it("allows calls up to the max within the window", () => {
		const isAllowed = createRateLimiter({ windowMs: 1000, max: 3 });
		expect(isAllowed("a")).toBe(true);
		expect(isAllowed("a")).toBe(true);
		expect(isAllowed("a")).toBe(true);
	});

	it("blocks the call once max is exceeded within the window", () => {
		const isAllowed = createRateLimiter({ windowMs: 1000, max: 3 });
		isAllowed("a");
		isAllowed("a");
		isAllowed("a");
		expect(isAllowed("a")).toBe(false);
	});

	it("tracks each key independently", () => {
		const isAllowed = createRateLimiter({ windowMs: 1000, max: 1 });
		expect(isAllowed("a")).toBe(true);
		expect(isAllowed("b")).toBe(true);
		expect(isAllowed("a")).toBe(false);
		expect(isAllowed("b")).toBe(false);
	});

	it("allows calls again once the window has elapsed", () => {
		let currentTime = 0;
		const isAllowed = createRateLimiter({
			windowMs: 1000,
			max: 1,
			now: () => currentTime,
		});
		expect(isAllowed("a")).toBe(true);
		expect(isAllowed("a")).toBe(false);
		currentTime = 1001;
		expect(isAllowed("a")).toBe(true);
	});
});
