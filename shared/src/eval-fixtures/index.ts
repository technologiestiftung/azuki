import type { PersonaId } from "../eval-types";
import type { UserProfile } from "../types";
import { nico } from "./nico";
import { elina } from "./elina";
import { karim } from "./karim";

export const PERSONAS: Record<PersonaId, UserProfile> = {
	nico,
	elina,
	karim,
};

export const PERSONA_IDS: PersonaId[] = ["nico", "elina", "karim"];

export { nico, elina, karim };
