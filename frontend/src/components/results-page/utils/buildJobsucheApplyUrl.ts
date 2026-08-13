export function buildJobsucheApplyUrl(referenznummer: string): string {
	return `https://www.arbeitsagentur.de/jobsuche/suche?id=${encodeURIComponent(referenznummer)}&suchbereich=ausbildung`;
}
