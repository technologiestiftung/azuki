import { content } from "../../../../content";
export const strengths = [
	{
		id: "teamwork",
		title: content["strengths.cards.teamwork.title"],
		description: content["strengths.cards.teamwork.description"],
		illustration: "/illustrations/teamwork.svg",
	},
	{
		id: "logical-thinking",
		title: content["strengths.cards.logical-thinking.title"],
		description: content["strengths.cards.logical-thinking.description"],
		illustration: "/illustrations/logical-thinking.svg",
	},
	{
		id: "creativity",
		title: content["strengths.cards.creativity.title"],
		description: content["strengths.cards.creativity.description"],
		illustration: "/illustrations/creativity.svg",
	},
	{
		id: "communication",
		title: content["strengths.cards.communication.title"],
		description: content["strengths.cards.communication.description"],
		illustration: "/illustrations/communication.svg",
	},
	{
		id: "craftsmanship",
		title: content["strengths.cards.craftsmanship.title"],
		description: content["strengths.cards.craftsmanship.description"],
		illustration: "/illustrations/craftsmanship.svg",
	},
	{
		id: "concentration",
		title: content["strengths.cards.concentration.title"],
		description: content["strengths.cards.concentration.description"],
		illustration: "/illustrations/concentration.svg",
	},
	{
		id: "precision",
		title: content["strengths.cards.precision.title"],
		description: content["strengths.cards.precision.description"],
		illustration: "/illustrations/precise-work.svg",
	},
	{
		id: "perseverance",
		title: content["strengths.cards.perseverance.title"],
		description: content["strengths.cards.perseverance.description"],
		illustration: "/illustrations/endurance.svg",
	},
];

/** Predefined swipe cards plus one custom-strength screen at hash #{strengths.length}. */
export const STRENGTH_STEP_CARD_COUNT = strengths.length + 1;
