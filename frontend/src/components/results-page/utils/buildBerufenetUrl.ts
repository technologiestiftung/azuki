export function buildBerufenetUrl(occupationId: number): string {
	return `https://web.arbeitsagentur.de/berufenet/beruf/${encodeURIComponent(occupationId)}`;
}
