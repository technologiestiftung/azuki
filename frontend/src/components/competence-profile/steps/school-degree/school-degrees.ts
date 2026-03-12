import { content } from "../../../../content/de";
import type { EducationLevel } from "../../../../common";

export const schoolDegrees: { value: EducationLevel; label: string }[] = [
	{
		value: "secondary",
		label: content["schoolDegree.option.secondary.label"],
	},
	{
		value: "extended_secondary",
		label: content["schoolDegree.option.extendedSecondary.label"],
	},
	{
		value: "intermediate",
		label: content["schoolDegree.option.intermediate.label"],
	},
	{
		value: "vocational_diploma",
		label: content["schoolDegree.option.vocationalDiploma.label"],
	},
	{
		value: "university_entrance",
		label: content["schoolDegree.option.universityEntrance.label"],
	},
	{
		value: "none",
		label: content["schoolDegree.option.none.label"],
	},
	{
		value: "foreign_degree",
		label: content["schoolDegree.option.foreign.label"],
	},
	{
		value: "unknown",
		label: content["schoolDegree.option.unknown.label"],
	},
];
