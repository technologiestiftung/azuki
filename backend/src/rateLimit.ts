import type { Context } from "hono";

interface RateLimiterOptions {
	windowMs: number;
	max: number;
	now?: () => number;
}

export function createRateLimiter({
	windowMs,
	max,
	now = Date.now,
}: RateLimiterOptions): (key: string) => boolean {
	const hits = new Map<string, number[]>();

	return function isAllowed(key: string): boolean {
		const timestamp = now();
		const recent = (hits.get(key) ?? []).filter(
			(hit) => timestamp - hit < windowMs,
		);
		if (recent.length >= max) {
			hits.set(key, recent);
			return false;
		}
		recent.push(timestamp);
		hits.set(key, recent);
		return true;
	};
}

// Trusts x-forwarded-for as edge-injected and unspoofable (true on the
// current Vercel deployment) — re-verify this assumption on any other host.
export function getClientIp(c: Context): string {
	const forwardedFor = c.req.header("x-forwarded-for");
	if (forwardedFor) {
		return forwardedFor.split(",")[0].trim();
	}
	return c.req.header("x-real-ip") ?? "unknown";
}
