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
		],
	},
	{
		name: content["schoolSubjects.sciences.label"],
		subjects: [
			{
				label: content["schoolSubjects.sciences.math.label"],
				value: "math",
			},
			{
				label: content["schoolSubjects.sciences.physics.label"],
				value: "physics",
			},
			{
				label: content["schoolSubjects.sciences.chemistry.label"],
				value: "chemistry",
			},
			{
				label: content["schoolSubjects.sciences.biology.label"],
				value: "biology",
			},
		],
	},
	{
		name: content["schoolSubjects.society.label"],
		subjects: [
			{
				label: content["schoolSubjects.society.economics.label"],
				value: "economics",
			},
			{
				label: content["schoolSubjects.society.ethics.label"],
				value: "ethics",
			},
			{
				label: content["schoolSubjects.society.religion.label"],
				value: "religion",
			},
		],
	},
	{
		name: content["schoolSubjects.creativity.label"],
		subjects: [
			{
				label: content["schoolSubjects.creativity.craftsAndTechnology.label"],
				value: "crafts_technology",
			},
			{
				label: content["schoolSubjects.creativity.computerScience.label"],
				value: "computer_science",
			},
			{
				label: content["schoolSubjects.creativity.art.label"],
				value: "art",
			},
			{
				label: content["schoolSubjects.creativity.music.label"],
				value: "music",
			},
			{
				label: content["schoolSubjects.creativity.sports.label"],
				value: "sports",
			},
		],
	},
];
