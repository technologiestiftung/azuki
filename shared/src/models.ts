export interface AiModel {
  id: string;
  label: string;
}

export const AI_MODELS: AiModel[] = [
  { id: "google/gemini-3-flash-preview", label: "Gemini 3 Flash" },
  { id: "google/gemini-3.1-pro-preview", label: "Gemini 3.1 Pro" },
  { id: "openai/gpt-5.4-mini", label: "GPT-5.4 Mini" },
  { id: "openai/gpt-5.4", label: "GPT-5.4" },
  { id: "anthropic/claude-sonnet-4.6", label: "Claude Sonnet 4.6" },
  { id: "mistralai/mistral-small-2603", label: "Mistral Small 4" },
];

export const AI_MODEL_IDS = new Set(AI_MODELS.map((m) => m.id));
