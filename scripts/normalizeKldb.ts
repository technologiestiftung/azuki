/**
 * Normalize a kldb2010 (German occupation code) value returned by the
 * BERUFENET API into a bare numeric string suitable for joining against
 * Destatis tables.
 *
 * BERUFENET sometimes returns codes prefixed with `"B "` (an agency-internal
 * marker for "Beruf"); strip so the result is purely numeric. A non-numeric
 * result after cleaning suggests the upstream API shape has changed — we
 * still return the value but emit a warning so the next maintainer notices.
 */
export function normalizeKldb(raw: string | null | undefined): string | null {
	if (!raw) return null;
	const cleaned = raw.replace(/^B\s+/, "").replace(/\s+/g, "").trim();
	if (!cleaned) return null;
	if (!/^\d+$/.test(cleaned)) {
		console.warn(
			`  unexpected kldb2010 shape: ${JSON.stringify(raw)} → ${JSON.stringify(cleaned)}`,
		);
	}
	return cleaned;
}
