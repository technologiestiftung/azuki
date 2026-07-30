import {
	fitPercent,
	formatOccupationDisplayName,
	type MatchedOccupation,
	type UserProfile,
} from "@azuki/shared";
import { schoolDegrees } from "../components/competence-profile/steps/school-degree/school-degrees";
import { categories as subjectCategories } from "../components/competence-profile/steps/school-subject-step/school-subjects";
import { interests as interestCategories } from "../components/competence-profile/steps/interests-step/interests";
import { strengths as strengthOptions } from "../components/competence-profile/steps/strengths-step/strengths";
import { workExpectationOptions } from "../components/competence-profile/steps/work-expectation-options";
import { noGos as noGoOptions } from "../components/competence-profile/steps/no-gos-step/no-gos";
import { exportPdfTable } from "../components/results-page/utils/exportPdfTable";
import { content } from "../content";
import { workPreferencePairs } from "../content/work-preference-pairs";

function resolveSubjectLabel(id: string): string {
	for (const category of subjectCategories) {
		const match = category.subjects.find((subject) => subject.value === id);
		if (match) {
			return match.label;
		}
	}
	return id;
}

function resolveInterestLabel(id: string): string {
	for (const category of interestCategories) {
		const match = category.interests.find((interest) => interest.value === id);
		if (match) {
			return match.label;
		}
	}
	return id;
}

function joinLabels(labels: string[]): string {
	return labels.join(", ");
}

function buildProfileRows(
	profile: UserProfile,
	topOccupations: MatchedOccupation[],
): string[][] {
	const rows: string[][] = [];

	const schoolDegreeLabel = schoolDegrees.find(
		(degree) => degree.value === profile.educationLevel,
	)?.label;
	if (schoolDegreeLabel) {
		rows.push([
			profile.inSchool
				? content["profile.schoolDegreeLabel.inSchool"]
				: content["profile.schoolDegreeLabel.planned"],
			schoolDegreeLabel,
		]);
	}

	const favoriteSubjects = [
		...profile.favoriteSubjects,
		...profile.customSubjects,
	].map(resolveSubjectLabel);
	if (favoriteSubjects.length > 0) {
		rows.push([
			content["profile.favoriteSubjects"],
			joinLabels(favoriteSubjects),
		]);
	}

	const interests = [...profile.interests, ...profile.customInterests].map(
		resolveInterestLabel,
	);
	if (interests.length > 0) {
		rows.push([content["profile.interests"], joinLabels(interests)]);
	}

	const strengthScores = Object.entries(profile.strengths);
	const strongStrengths = strengthScores
		.filter(([, value]) => value >= 0.5)
		.map(([strengthId, value]) => {
			const label =
				strengthOptions.find((strength) => strength.id === strengthId)?.title ??
				strengthId;
			return `${label} (${Math.round(value * 100)} %)`;
		});
	const selectedCustomStrengths = profile.selectedCustomStrengths.filter(
		(strength) => profile.customStrengths.includes(strength),
	);
	const strengthLabels = [
		...strongStrengths,
		...selectedCustomStrengths.map((label) => `${label} (100 %)`),
	];
	if (strengthLabels.length > 0) {
		rows.push([content["profile.strengths"], joinLabels(strengthLabels)]);
	}

	const hardshipLabels = strengthScores
		.filter(([, value]) => value < 0.5)
		.map(([strengthId, value]) => {
			const label =
				strengthOptions.find((strength) => strength.id === strengthId)?.title ??
				strengthId;
			return `${label} (${Math.round(value * 100)} %)`;
		});
	if (hardshipLabels.length > 0) {
		rows.push([content["profile.hardships"], joinLabels(hardshipLabels)]);
	}

	const workExpectations = [
		...profile.workExpectations,
		...profile.customWorkExpectations,
	].map(
		(expectation) =>
			workExpectationOptions.find((option) => option.value === expectation)
				?.label ?? expectation,
	);
	if (workExpectations.length > 0) {
		rows.push([
			content["profile.workExpectations"],
			joinLabels(workExpectations),
		]);
	}

	if (profile.practicalExperiences.length > 0) {
		const experienceLabels = profile.practicalExperiences.map(
			(experience) => `${experience.description} (${experience.rating}/5)`,
		);
		rows.push([
			content["profile.practicalExperiences"],
			joinLabels(experienceLabels),
		]);
	}

	const workPreferenceLabels = Object.entries(profile.workPreferences)
		.filter(
			(entry): entry is [string, "a" | "b"] =>
				entry[1] === "a" || entry[1] === "b",
		)
		.map(([preferenceId, choice]) => {
			const pair = workPreferencePairs.find((item) => item.id === preferenceId);
			if (!pair) {
				return preferenceId;
			}
			return choice === "a" ? pair.a : pair.b;
		});
	if (workPreferenceLabels.length > 0) {
		rows.push([
			content["profile.workPreferences"],
			joinLabels(workPreferenceLabels),
		]);
	}

	const rejectedNoGos = Object.entries(profile.noGos)
		.filter(([, value]) => value === "rejected")
		.map(
			([noGoId]) =>
				noGoOptions.find((entry) => entry.id === noGoId)?.title ?? noGoId,
		);
	const noGoLabels = [...rejectedNoGos, ...profile.customNoGos];
	if (noGoLabels.length > 0) {
		rows.push([content["profile.noGos"], joinLabels(noGoLabels)]);
	}

	if (topOccupations.length > 0) {
		const occupationLabels = topOccupations.map((occupation) => {
			const name = formatOccupationDisplayName(occupation.name);
			return `${name} (passt zu ${fitPercent(occupation.score)} %)`;
		});
		rows.push([
			content["profile.topOccupationsTitle"],
			joinLabels(occupationLabels),
		]);
	}

	return rows;
}

export function exportProfilePdf(
	profile: UserProfile,
	topOccupations: MatchedOccupation[] = [],
): void {
	const body = buildProfileRows(profile, topOccupations);
	if (body.length === 0) {
		return;
	}

	exportPdfTable({
		filename: content["profile.export.filename"],
		title: content["profile.title"],
		head: [
			content["profile.export.category"],
			content["profile.export.details"],
		],
		body,
		columnWeights: [1.4, 3],
	});
}
