import type { UserProfile } from "./types";

export interface Persona {
	id: string;
	name: string;
	description: string | null;
	profile: UserProfile;
	tierS: number[];
	tierA: number[];
	tierC: number[];
	createdAt: string;
	updatedAt: string;
}
