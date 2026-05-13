import type { Persona, UserProfile } from "@azuki/shared";

interface PersonaRow {
    id: string;
    name: string;
    description: string | null;
    profile: UserProfile;
    tier_s: number[];
    tier_a: number[];
    tier_c: number[];
    created_at: string;
    updated_at: string;
}

export function rowToPersona(row: PersonaRow): Persona {
    return {
        id: row.id,
        name: row.name,
        description: row.description,
        profile: row.profile,
        tierS: row.tier_s,
        tierA: row.tier_a,
        tierC: row.tier_c,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export interface PersonaInsertRow {
    id: string;
    name: string;
    description: string | null;
    profile: UserProfile;
    tier_s: number[];
    tier_a: number[];
    tier_c: number[];
}
