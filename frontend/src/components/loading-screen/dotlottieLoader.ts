// Lazy-loads DotLottie and configures WASM (required before first use). Cached so init runs once.
type DotLottieModule = typeof import("@lottiefiles/dotlottie-react");

export const LOADING_ANIMATION_URLS = {
	highFive: "/animations/high-five.lottie",
	loop: "/animations/loop.lottie",
} as const;

let initPromise: Promise<DotLottieModule> | null = null;
let resolvedModule: DotLottieModule | null = null;
let preloadPromise: Promise<void> | null = null;

export function getLoadedDotLottie(): DotLottieModule | null {
	return resolvedModule;
}

export function loadDotLottie(): Promise<DotLottieModule> {
	if (!initPromise) {
		initPromise = Promise.all([
			import("@lottiefiles/dotlottie-react"),
			import("@lottiefiles/dotlottie-web/dotlottie-player.wasm?url"),
		]).then(([reactMod, wasmMod]) => {
			reactMod.setWasmUrl(wasmMod.default);
			resolvedModule = reactMod;
			return reactMod;
		});
	}
	return initPromise;
}

export function preloadLoadingAnimations(): Promise<void> {
	if (!preloadPromise) {
		preloadPromise = Promise.all([
			loadDotLottie(),
			fetch(LOADING_ANIMATION_URLS.highFive),
			fetch(LOADING_ANIMATION_URLS.loop),
			import("./LoadingScreen"),
		]).then(() => undefined);
	}
	return preloadPromise;
}
