import { useAppStore } from "../store/useAppStore";
import { useMatchResultsStore } from "../store/useMatchResultsStore";

export async function downloadProfile(): Promise<void> {
	const profile = useAppStore.getState().profile;
	const matchResults = useMatchResultsStore.getState().matchResults;
	const topOccupations = [...(matchResults?.occupations ?? [])]
		.sort((a, b) => b.score - a.score)
		.slice(0, 3);

	try {
		const { exportProfilePdf } = await import("./exportProfilePdf");
		await exportProfilePdf({ profile, topOccupations });
	} catch (err) {
		console.error("Failed to export profile PDF:", err);
	}
}
