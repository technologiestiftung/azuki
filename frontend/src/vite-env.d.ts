/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_API_URL?: string;
	readonly VITE_PREFILL_PROFILE?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
