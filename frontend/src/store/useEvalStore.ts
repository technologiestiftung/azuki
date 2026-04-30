import { create } from "zustand";
import type { EvalSnapshot } from "@azuki/shared";
import { DEFAULT_MODEL_ID } from "@azuki/shared";

const PROMPT_DRAFT_KEY = "eval.promptDraft";

interface EvalState {
	prompt: string;
	model: string;
	currentRun: EvalSnapshot | null;
	isRunning: boolean;
	error: string | null;

	setPrompt: (prompt: string) => void;
	setModel: (model: string) => void;
	setRunning: (running: boolean) => void;
	setError: (error: string | null) => void;
	pushNewRun: (snapshot: EvalSnapshot) => void;
}

const initialPrompt =
	typeof window !== "undefined"
		? (localStorage.getItem(PROMPT_DRAFT_KEY) ?? "")
		: "";

export const useEvalStore = create<EvalState>((set) => ({
	prompt: initialPrompt,
	model: DEFAULT_MODEL_ID,
	currentRun: null,
	isRunning: false,
	error: null,

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
}));
