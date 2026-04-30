import type { PersonaId } from "../eval-types";
import type { PersonaRubric } from "./types";
import { nicoRubric } from "./nico";
import { elinaRubric } from "./elina";
import { karimRubric } from "./karim";

export const RUBRICS: Record<PersonaId, PersonaRubric> = {
	nico: nicoRubric,
	elina: elinaRubric,
	karim: karimRubric,
};

export type {
	Verdict,
	CriterionResult,
	Criterion,
	PersonaRubric,
	ScoreReport,
} from "./types";
