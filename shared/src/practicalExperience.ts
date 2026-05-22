export interface PracticalExperienceEntry {
	id: string;
	description: string;
	selectedExperienceId: string | null;
	selectedExperienceLabel: string | null;
	rating: number;
	tags: string[];
}

export function getActivePracticalExperiences(
	experiences: PracticalExperienceEntry[],
	selectedIds: string[],
): PracticalExperienceEntry[] {
	const selectedIdSet = new Set(selectedIds);
	return experiences.filter((entry) => selectedIdSet.has(entry.id));
}

export function formatPracticalExperiencesForApi(
	experiences: PracticalExperienceEntry[],
	selectedIds?: string[],
): string {
	const activeExperiences = selectedIds
		? getActivePracticalExperiences(experiences, selectedIds)
		: experiences;

	if (activeExperiences.length === 0) {
		return "";
	}

	return activeExperiences
		.map((entry) => {
			const parts = [entry.description];
			if (entry.rating > 0) {
				parts.push(`Bewertung: ${entry.rating}/5`);
			}
			if (entry.tags.length > 0) {
				parts.push(`Tags: ${entry.tags.join(", ")}`);
			}
			return parts.join(" – ");
		})
		.join("; ");
}
