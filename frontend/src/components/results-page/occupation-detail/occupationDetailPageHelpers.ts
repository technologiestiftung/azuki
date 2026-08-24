import type { MatchedOccupation, Occupation } from "@azuki/shared";
import {
	resolveOccupationShortDescription,
	resolveOccupationTaskBullets,
} from "@azuki/shared";
import { content } from "../../../content";
import { formatOccupationSalary } from "../utils/formatOccupationSalary";
import { formatOccupationSchoolDegree } from "../utils/formatOccupationSchoolDegree";

type DetailOccupation = Occupation | null | undefined;
type DetailMatched = MatchedOccupation | undefined;

export function resolveDetailTaskItems(
	occupation: DetailOccupation,
	matchedOccupation: DetailMatched,
): string[] {
	const taskBullets = occupation
		? resolveOccupationTaskBullets(occupation)
		: [];
	if (taskBullets.length > 0) {
		return taskBullets;
	}
	const fallback = occupation
		? resolveOccupationShortDescription(occupation)
		: (matchedOccupation?.shortDescription ?? "");
	return fallback ? [fallback] : [];
}

export function resolveDetailSalaryLabel(occupation: DetailOccupation): string {
	if (occupation?.salaryKnown && occupation.salaryMonthlyMedian !== null) {
		return formatOccupationSalary(occupation.salaryMonthlyMedian);
	}
	return content["results.detail.salary.unknown"];
}

export function resolveDetailSchoolDegreeLabel(
	occupation: DetailOccupation,
): string {
	return formatOccupationSchoolDegree(
		occupation?.degreeStats,
		occupation?.accessLevel,
	);
}

export function resolveDetailStatusMessage(detail: {
	error: string | null;
	loading: boolean;
	occupation: DetailOccupation;
}): string | null {
	if (detail.error) {
		return detail.error;
	}
	if (detail.loading && !detail.occupation) {
		return content["results.detail.loading"];
	}
	return null;
}

export function resolveHeroImageUrls(occupation: DetailOccupation): string[] {
	if (!occupation) {
		return [];
	}
	return occupation.images
		.map((image) => image.url?.trim())
		.filter((url): url is string => Boolean(url));
}
