import { content } from "../../../../content/de";
import type { SubjectDefinition } from "../../../../common";

export const categories: {
	name: string;
	subjects: { label: string; value: SubjectDefinition["id"]; icon: string }[];
}[] = [
	{
		name: content["schoolSubjects.languages.label"],
		subjects: [
			{
				label: content["schoolSubjects.languages.german.label"],
				value: "german",
				icon: content["schoolSubjects.languages.german.icon"],
			},
			{
				label: content["schoolSubjects.languages.english.label"],
				value: "english",
				icon: content["schoolSubjects.languages.english.icon"],
			},
			{
				label: content["schoolSubjects.languages.other.label"],
				value: "other_languages",
				icon: content["schoolSubjects.languages.other.icon"],
			},
		],
	},
	{
		name: content["schoolSubjects.mint.label"],
		subjects: [
			{
				label: content["schoolSubjects.mint.math.label"],
				value: "math",
				icon: content["schoolSubjects.mint.math.icon"],
			},
			{
				label: content["schoolSubjects.mint.physics.label"],
				value: "physics",
				icon: content["schoolSubjects.mint.physics.icon"],
			},
			{
				label: content["schoolSubjects.mint.biology.label"],
				value: "biology",
				icon: content["schoolSubjects.mint.biology.icon"],
			},
			{
				label: content["schoolSubjects.mint.chemistry.label"],
				value: "chemistry",
				icon: content["schoolSubjects.mint.chemistry.icon"],
			},
			{
				label: content["schoolSubjects.mint.computerScience.label"],
				value: "computer_science",
				icon: content["schoolSubjects.mint.computerScience.icon"],
			},
		],
	},
	{
		name: content["schoolSubjects.society.label"],
		subjects: [
			{
				label: content["schoolSubjects.society.wat.label"],
				value: "wat",
				icon: content["schoolSubjects.society.wat.icon"],
			},
			{
				label: content["schoolSubjects.society.homeEconomics.label"],
				value: "home_economics",
				icon: content["schoolSubjects.society.homeEconomics.icon"],
			},
			{
				label: content["schoolSubjects.society.ethicsReligion.label"],
				value: "ethics_religion",
				icon: content["schoolSubjects.society.ethicsReligion.icon"],
			},
			{
				label: content["schoolSubjects.society.pedagogy.label"],
				value: "pedagogy",
				icon: content["schoolSubjects.society.pedagogy.icon"],
			},
			{
				label: content["schoolSubjects.society.history.label"],
				value: "history",
				icon: content["schoolSubjects.society.history.icon"],
			},
			{
				label: content["schoolSubjects.society.politics.label"],
				value: "politics",
				icon: content["schoolSubjects.society.politics.icon"],
			},
			{
				label: content["schoolSubjects.society.geography.label"],
				value: "geography",
				icon: content["schoolSubjects.society.geography.icon"],
			},
		],
	},
	{
		name: content["schoolSubjects.creativity.label"],
		subjects: [
			{
				label: content["schoolSubjects.creativity.music.label"],
				value: "music",
				icon: content["schoolSubjects.creativity.music.icon"],
			},
			{
				label: content["schoolSubjects.creativity.art.label"],
				value: "art",
				icon: content["schoolSubjects.creativity.art.icon"],
			},
			{
				label: content["schoolSubjects.creativity.performingArts.label"],
				value: "performing_arts",
				icon: content["schoolSubjects.creativity.performingArts.icon"],
			},
			{
				label: content["schoolSubjects.sports.sports.label"],
				value: "sports",
				icon: content["schoolSubjects.sports.sports.icon"],
			},
		],
	},
];
