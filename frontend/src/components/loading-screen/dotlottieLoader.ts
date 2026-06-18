// Lazy-loads DotLottie and configures WASM (required before first use). Cached so init runs once.
type DotLottieModule = typeof import("@lottiefiles/dotlottie-react");

let initPromise: Promise<DotLottieModule> | null = null;

export function loadDotLottie(): Promise<DotLottieModule> {
	if (!initPromise) {
		initPromise = Promise.all([
			import("@lottiefiles/dotlottie-react"),
			import("@lottiefiles/dotlottie-web/dotlottie-player.wasm?url"),
		]).then(([reactMod, wasmMod]) => {
			reactMod.setWasmUrl(wasmMod.default);
			return reactMod;
		});
	}
	return initPromise;
}
