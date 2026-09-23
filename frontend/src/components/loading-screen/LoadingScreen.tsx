import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { content } from "../../content";
import { useAppStore } from "../../store/useAppStore";
import { useMatchResultsStore } from "../../store/useMatchResultsStore";
import { matchProfile } from "../../api/client";
import { LoadingProgressBar } from "./LoadingProgressBar";
import { LottiePlayer } from "./LottiePlayer";
import { LOADING_ANIMATION_URLS } from "./dotlottieLoader";
import { ROUTE_PATHS } from "../../routing/routes";

const SUCCESS_FREEZE_MS = 2000;
const MIN_SUCCESS_MS = 3000;
// Cap, in case the animation never loads or never reports completion.
const MAX_SUCCESS_MS = 6000;
const MIN_WAITING_MS = 10_000;
const WHITE_FADE_MS = 400;
const PROGRESS_BAR_DURATION_MS = 30_000;

type ContentPhase = "success" | "waiting" | "error";

const sleep = (ms: number) =>
	new Promise<void>((resolve) => setTimeout(resolve, Math.max(0, ms)));

function createDeferred() {
	let resolve = () => {};
	const promise = new Promise<void>((res) => {
		resolve = res;
	});
	return { promise, resolve };
}

export function LoadingScreen() {
	const profile = useAppStore((state) => state.profile);
	const setMatchResults = useMatchResultsStore(
		(state) => state.setMatchResults,
	);
	const navigate = useNavigate();

	const [contentPhase, setContentPhase] = useState<ContentPhase>("success");
	const [successAnimationReady, setSuccessAnimationReady] = useState(false);
	const [overlayOpacity, setOverlayOpacity] = useState(0);

	const animationComplete = useRef(createDeferred()).current;
	const successShownAt = useRef(performance.now());
	const waitingStartTime = useRef<number | null>(null);
	const started = useRef(false);
	const mounted = useRef(true);

	function handleSuccessReady() {
		successShownAt.current = performance.now();
		setSuccessAnimationReady(true);
	}

	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);

	useEffect(() => {
		if (started.current) {
			return;
		}
		started.current = true;

		const fadeTo = async (opacity: number) => {
			setOverlayOpacity(opacity);
			await sleep(WHITE_FADE_MS);
		};

		const showSuccessPhase = async () => {
			await Promise.race([
				animationComplete.promise.then(() => sleep(SUCCESS_FREEZE_MS)),
				sleep(MAX_SUCCESS_MS),
			]);
			await sleep(
				MIN_SUCCESS_MS - (performance.now() - successShownAt.current),
			);
			await fadeTo(1);
		};

		const showWaitingPhase = async () => {
			waitingStartTime.current = performance.now();
			setContentPhase("waiting");
			await fadeTo(0);
		};

		const fail = (err: unknown) => {
			console.error("Match API error:", err);
			setOverlayOpacity(0);
			setContentPhase("error");

			const message = err instanceof Error ? err.message : "";
			if (message.includes("401") || message.includes("403")) {
				navigate(ROUTE_PATHS.login, { replace: true });
			}
		};

		const run = async () => {
			const cached = useMatchResultsStore.getState().matchResults;
			const results = cached ? Promise.resolve(cached) : matchProfile(profile);
			// Awaited below; this keeps an early rejection from being reported as unhandled.
			void results.catch(() => {});

			await showSuccessPhase();
			await showWaitingPhase();
			const [matched] = await Promise.all([results, sleep(MIN_WAITING_MS)]);

			if (!mounted.current) {
				return;
			}
			setMatchResults(matched);
			navigate(ROUTE_PATHS.resultsList);
		};

		void run().catch(fail);
	}, [profile, setMatchResults, navigate, animationComplete]);

	return (
		<div className="relative flex flex-col items-center justify-center min-h-[100dvh] px-4 gap-7">
			{contentPhase === "success" && (
				<>
					<LottiePlayer
						src={LOADING_ANIMATION_URLS.highFive}
						onComplete={animationComplete.resolve}
						onReady={handleSuccessReady}
					/>
					{successAnimationReady && (
						<div className="flex flex-col items-center justify-center gap-3 px-4">
							<h2 className="text-4xl leading-[120%] font-bold text-center">
								{content["loading.success.title"]}
							</h2>
							<p className="text-xl font-normal text-center">
								{content["loading.success.description"]}
							</p>
						</div>
					)}
				</>
			)}

			{contentPhase === "waiting" && (
				<>
					<LottiePlayer src={LOADING_ANIMATION_URLS.loop} loop />
					<div className="flex flex-col items-center justify-center gap-3 px-4">
						<h2 className="text-4xl leading-[120%] font-bold text-center">
							{content["loading.waiting.title"]}
						</h2>
						<p className="text-xl font-normal text-center">
							{content["loading.waiting.description"]}
						</p>
					</div>
					<div className="px-10 w-full">
						<LoadingProgressBar
							durationMs={PROGRESS_BAR_DURATION_MS}
							startTime={waitingStartTime.current ?? undefined}
						/>
					</div>
				</>
			)}

			<div
				className="absolute inset-0 z-10 bg-white pointer-events-none"
				style={{
					opacity: overlayOpacity,
					transition: `opacity ${WHITE_FADE_MS}ms ease-in-out`,
				}}
				aria-hidden
			/>
		</div>
	);
}
