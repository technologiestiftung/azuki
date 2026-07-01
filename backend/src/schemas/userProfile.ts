import { z } from "zod";

const EducationLevelSchema = z.enum([
	"secondary",
	"extended_secondary",
	"intermediate",
	"none",
	"university_entrance",
	"vocational_diploma",
	"foreign_degree",
	"unknown",
]);

const NoGoAnswerSchema = z.enum(["rejected", "accepted"]);

const WorkPreferenceChoiceSchema = z.enum(["a", "b"]);

const PracticalExperienceEntrySchema = z
	.object({
		id: z.string(),
		description: z.string(),
		selectedExperienceId: z.string().nullable(),
		selectedExperienceLabel: z.string().nullable(),
		rating: z.number(),
	})
	.strip();

function normalizeLegacyProfile(input: unknown): unknown {
	if (input === null || typeof input !== "object") {
		return input;
	}
	const raw = input as Record<string, unknown>;
	if ("practicalExperiences" in raw) {
		return input;
	}
	const legacyText =
		typeof raw.practicalExperience === "string"
			? raw.practicalExperience.trim()
			: "";
	const { practicalExperience: _legacy, ...rest } = raw;
	if (!legacyText) {
		return {
			...rest,
			practicalExperiences: [],
			selectedPracticalExperienceIds: [],
		};
	}
	const id = "legacy";
	return {
		...rest,
		practicalExperiences: [
			{
				id,
				description: legacyText,
				selectedExperienceId: null,
				selectedExperienceLabel: null,
				rating: 0,
			},
		],
		selectedPracticalExperienceIds: [id],
	};
}

const UserProfileObjectSchema = z.object({
	inSchool: z.boolean().nullable(),
	educationLevel: EducationLevelSchema.nullable(),
	favoriteSubjects: z.array(z.string()),
	customSubjects: z.array(z.string()).default([]),
	interests: z.array(z.string()),
	customInterests: z.array(z.string()),
	workExpectations: z.array(z.string()),
	customWorkExpectations: z.array(z.string()).default([]),
	strengths: z.record(z.string(), z.number()),
	customStrengths: z.array(z.string()).default([]),
	selectedCustomStrengths: z.array(z.string()).default([]),
	practicalExperiences: z.array(PracticalExperienceEntrySchema).default([]),
	selectedPracticalExperienceIds: z.array(z.string()).default([]),
	workPreferences: z.record(z.string(), WorkPreferenceChoiceSchema.nullable()),
	noGos: z.record(z.string(), NoGoAnswerSchema.nullable()),
	customNoGos: z.array(z.string()).default([]),
});

export const UserProfileSchema = z.preprocess(
	normalizeLegacyProfile,
	UserProfileObjectSchema,
);
