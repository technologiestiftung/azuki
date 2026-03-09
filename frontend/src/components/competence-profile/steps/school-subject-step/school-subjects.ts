import { content } from "../../../../content/de";
import type { SubjectDefinition } from "../../../../common";

export const categories: {
	name: string;
	subjects: { label: string; value: SubjectDefinition["id"] }[];
}[] = [
	{
		name: content["schoolSubjects.languages.label"],
		subjects: [
			{
				label: content["schoolSubjects.languages.german.label"],
				value: "german",
			},
			{
				label: content["schoolSubjects.languages.english.label"],
				value: "english",
			},
			{
				label: content["schoolSubjects.languages.other.label"],
				value: "other_languages",
			},
		],
	},
	{
		name: content["schoolSubjects.mint.label"],
		subjects: [
			{
				label: content["schoolSubjects.mint.math.label"],
				value: "math",
			},
			{
				label: content["schoolSubjects.mint.physics.label"],
				value: "physics",
			},
			{
				label: content["schoolSubjects.mint.biology.label"],
				value: "biology",
			},
			{
				label: content["schoolSubjects.mint.chemistry.label"],
				value: "chemistry",
			},
			{
				label: content["schoolSubjects.mint.computerScience.label"],
				value: "computer_science",
			},
		],
	},
	{
		name: content["schoolSubjects.society.label"],
		subjects: [
			{
				label: content["schoolSubjects.society.wat.label"],
				value: "wat",
			},
			{
				label: content["schoolSubjects.society.homeEconomics.label"],
				value: "home_economics",
			},
			{
				label: content["schoolSubjects.society.ethicsReligion.label"],
				value: "ethics_religion",
			},
			{
				label: content["schoolSubjects.society.pedagogy.label"],
				value: "pedagogy",
			},
			{
				label: content["schoolSubjects.society.history.label"],
				value: "history",
			},
			{
				label: content["schoolSubjects.society.politics.label"],
				value: "politics",
			},
			{
				label: content["schoolSubjects.society.geography.label"],
				value: "geography",
			},
		],
	},
	{
		name: content["schoolSubjects.creativity.label"],
		subjects: [
			{
				label: content["schoolSubjects.creativity.music.label"],
				value: "music",
			},
			{
				label: content["schoolSubjects.creativity.art.label"],
				value: "art",
			},
			{
				label: content["schoolSubjects.creativity.performingArts.label"],
				value: "performing_arts",
			},
		],
	},
	{
		name: content["schoolSubjects.sports.label"],
		subjects: [
			{
				label: content["schoolSubjects.sports.sports.label"],
				value: "sports",
			},
		],
	},
];
