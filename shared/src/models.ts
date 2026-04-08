export interface AiModel {
  id: string;
  label: string;
}

export const DEFAULT_MODEL_ID = "google/gemini-3-flash-preview";

export const AI_MODELS: AiModel[] = [
  { id: "google/gemini-3-flash-preview", label: "Gemini 3 Flash (default)" },
  { id: "google/gemini-3.1-pro-preview-20260219", label: "Gemini 3.1 Pro" },
  { id: "openai/gpt-5.4-mini", label: "GPT-5.4 Mini" },
  { id: "openai/gpt-5.4", label: "GPT-5.4" },
  { id: "anthropic/claude-sonnet-4.6", label: "Claude Sonnet 4.6" },
];

export const AI_MODEL_IDS = new Set(AI_MODELS.map((m) => m.id));
