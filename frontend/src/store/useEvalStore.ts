import { create } from "zustand";
import type { EvalSnapshot, Persona } from "@azuki/shared";
import { DEFAULT_MODEL_ID } from "@azuki/shared";
import { listPersonas } from "../api/client";

const PROMPT_DRAFT_KEY = "eval.promptDraft";
const SELECTED_PERSONA_IDS_KEY = "eval.selectedPersonaIds";

interface EvalState {
	prompt: string;
	model: string;
	currentRun: EvalSnapshot | null;
	isRunning: boolean;
	error: string | null;
	personas: Persona[] | null;
	selectedPersonaIds: Set<string>;

	setPrompt: (prompt: string) => void;
	setModel: (model: string) => void;
	setRunning: (running: boolean) => void;
	setError: (error: string | null) => void;
	pushNewRun: (snapshot: EvalSnapshot) => void;
	fetchPersonas: () => Promise<void>;
	setSelectedPersonaIds: (ids: Set<string>) => void;
	togglePersonaSelection: (id: string) => void;
	addPersona: (persona: Persona) => void;
	replacePersona: (persona: Persona) => void;
	removePersona: (id: string) => void;
}

const initialPrompt =
	typeof window !== "undefined"
		? (localStorage.getItem(PROMPT_DRAFT_KEY) ?? "")
		: "";

const initialSelectedIds = (() => {
	if (typeof window === "undefined") {
		return new Set<string>();
	}
	const raw = localStorage.getItem(SELECTED_PERSONA_IDS_KEY);
	if (!raw) {
		return new Set<string>();
	}
	try {
		const parsed = JSON.parse(raw);
		return new Set<string>(Array.isArray(parsed) ? parsed : []);
	} catch {
		return new Set<string>();
	}
})();

function persistSelected(ids: Set<string>): void {
	if (typeof window !== "undefined") {
		localStorage.setItem(
			SELECTED_PERSONA_IDS_KEY,
			JSON.stringify(Array.from(ids)),
		);
	}
}

export const useEvalStore = create<EvalState>((set, get) => ({
	prompt: initialPrompt,
	model: DEFAULT_MODEL_ID,
	currentRun: null,
	isRunning: false,
	error: null,
	personas: null,
	selectedPersonaIds: initialSelectedIds,

	setPrompt: (prompt) => {
		if (typeof window !== "undefined") {
			localStorage.setItem(PROMPT_DRAFT_KEY, prompt);
		}
		set({ prompt });
	},
	setModel: (model) => set({ model }),
	setRunning: (running) => set({ isRunning: running }),
	setError: (error) => set({ error }),
	pushNewRun: (snapshot) => set({ currentRun: snapshot }),

	fetchPersonas: async () => {
		const personas = await listPersonas();
		const current = get().selectedPersonaIds;
		let next = current;
		if (current.size === 0) {
			next = new Set(personas.map((p) => p.id));
			persistSelected(next);
		}
		set({ personas, selectedPersonaIds: next });
	},

	setSelectedPersonaIds: (ids) => {
		persistSelected(ids);
		set({ selectedPersonaIds: ids });
	},

	togglePersonaSelection: (id) => {
		const current = get().selectedPersonaIds;
		const next = new Set(current);
		if (next.has(id)) {
			next.delete(id);
		} else {
			next.add(id);
		}
		persistSelected(next);
		set({ selectedPersonaIds: next });
	},

	addPersona: (persona) => {
		const current = get();
		const nextPersonas = current.personas
			? [...current.personas, persona]
			: [persona];
		const nextSelected = new Set(current.selectedPersonaIds);
		nextSelected.add(persona.id);
		persistSelected(nextSelected);
		set({ personas: nextPersonas, selectedPersonaIds: nextSelected });
	},

	replacePersona: (persona) => {
		const current = get().personas;
		if (!current) {
			return;
		}
		const idx = current.findIndex((p) => p.id === persona.id);
		if (idx === -1) {
			return;
		}
		const next = [...current];
		next[idx] = persona;
		set({ personas: next });
	},

	removePersona: (id) => {
		const current = get();
		if (!current.personas) {
			return;
		}
		const nextPersonas = current.personas.filter((p) => p.id !== id);
		const nextSelected = new Set(current.selectedPersonaIds);
		nextSelected.delete(id);
		persistSelected(nextSelected);
		set({ personas: nextPersonas, selectedPersonaIds: nextSelected });
	},
}));
