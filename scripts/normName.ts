/**
 * Strips DAZUBI's bracketed Ausbildungsbereich suffixes, collapses gender
 * forms (Kaufmann/-frau, /-in, /-r) and joining particles. Lifted verbatim
 * from the previous tools/eval-baseline implementation so output stays
 * byte-identical.
 */
export function normName(s: string): string {
	if (!s) return "";
	let n = s.toLowerCase().replace(/\s+/g, " ").trim();
	n = n.replace(/\s*\([^)]*\)/g, "");
	n = n.replace(/(\w+mann)\/(-?)\2?\1?(?:kauf|fach)?frau/g, "$1");
	n = n.replace(/kaufmann\/kauffrau/g, "kaufmann");
	n = n.replace(/fachmann\/fachfrau/g, "fachmann");
	n = n.replace(/\/-?fachfrau\b/g, "");
	n = n.replace(/\/-?kauffrau\b/g, "");
	n = n.replace(/\/-?frau\b/g, "");
	n = n.replace(/\/-?in\b/g, "");
	n = n.replace(/\/-?r\b/g, "");
	n = n.replace(/\b(für|im|in|der|des|die|und|am|an|auf)\b/g, "");
	return n.replace(/[^a-zäöüß]/g, "");
}
