import { normName } from "@azuki/shared";

/** Normalized key for comparing preferred-job strings (matches backend resolution). */
export function preferredJobKey(job: string): string {
	return normName(job.trim());
}

export function isDuplicatePreferredJob(
	existing: readonly string[],
	candidate: string,
): boolean {
	const key = preferredJobKey(candidate);
	if (!key) {
		return true;
	}
	return existing.some((job) => preferredJobKey(job) === key);
}

/** Keeps the first occurrence of each normalized preferred job. */
export function dedupePreferredJobs(jobs: readonly string[]): string[] {
	const seen = new Set<string>();
	const result: string[] = [];

	for (const job of jobs) {
		const trimmed = job.trim();
		if (!trimmed) {
			continue;
		}
		const key = preferredJobKey(trimmed);
		if (!key || seen.has(key)) {
			continue;
		}
		seen.add(key);
		result.push(trimmed);
	}

	return result;
}
