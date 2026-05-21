/** Parenthetical qualifiers redundant on an Ausbildungsberufe results page. */
const REDUNDANT_TITLE_SUFFIXES: RegExp[] = [
	/\s*\(Ausbildung\)/gi,
	/\s*\(doppelt qualifizierende Ausbildung\)/gi,
	/\s*\(duale Ausbildung\)/gi,
	/\s*\(schulische Ausbildung\)/gi,
];

/** Strips redundant “Ausbildung” qualifiers from BERUFENET occupation titles. */
export function formatOccupationDisplayName(name: string): string {
	let result = name;
	for (const pattern of REDUNDANT_TITLE_SUFFIXES) {
		result = result.replace(pattern, "");
	}
	return result.replace(/\s+/g, " ").trim();
}
