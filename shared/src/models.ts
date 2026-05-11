export interface AiModel {
  id: string;
  label: string;
}

export const DEFAULT_MODEL_ID = "mistralai/mistral-large-2512";

export const AI_MODELS: AiModel[] = [
  { id: "mistralai/mistral-large-2512", label: "Mistral Large 2512 (default)" },
  { id: "google/gemini-3-flash-preview", label: "Gemini 3 Flash" },
  { id: "google/gemini-3.1-pro-preview-20260219", label: "Gemini 3.1 Pro" },
  { id: "openai/gpt-5.4-mini", label: "GPT-5.4 Mini" },
  { id: "openai/gpt-5.4", label: "GPT-5.4" },
  { id: "anthropic/claude-sonnet-4.6", label: "Claude Sonnet 4.6" },
];

export const AI_MODEL_IDS = new Set(AI_MODELS.map((m) => m.id));
