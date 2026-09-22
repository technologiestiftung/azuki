import { useCallback, useEffect, useRef, useState } from "react";
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
const WHITE_FADE_MS = 400;
const PROGRESS_BAR_DURATION_MS = 30_000;

type ContentPhase = "success" | "waiting" | "error";

export function LoadingScreen() {
	const profile = useAppStore((state) => state.profile);
	const setMatchResults = useMatchResultsStore(
		(state) => state.setMatchResults,
	);
	const navigate = useNavigate();
	const called = useRef(false);
	const apiDone = useRef(false);
	const waitingStartTime = useRef<number | null>(null);
	const [contentPhase, setContentPhase] = useState<ContentPhase>("success");
	const [successAnimationReady, setSuccessAnimationReady] = useState(false);
	const [overlayOpacity, setOverlayOpacity] = useState(0);
	const overlayTarget = useRef<"in" | "out" | null>(null);
	const freezeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const transitionStarted = useRef(false);

	function startTransition() {
		if (transitionStarted.current) {
			return;
		}
		transitionStarted.current = true;
		overlayTarget.current = "in";
		setOverlayOpacity(1);
	}

	const tryNavigate = useCallback(() => {
		if (apiDone.current) {
			navigate(ROUTE_PATHS.resultsList);
		}
	}, [navigate]);

	const handleSuccessComplete = useCallback(() => {
		freezeTimer.current = setTimeout(startTransition, SUCCESS_FREEZE_MS);
	}, []);

	useEffect(() => {
		return () => {
			if (freezeTimer.current) {
				clearTimeout(freezeTimer.current);
			}
		};
	}, []);

	useEffect(() => {
		if (called.current) {
			return;
		}
		called.current = true;

		if (useMatchResultsStore.getState().matchResults) {
			apiDone.current = true;
			tryNavigate();
			return;
		}

		const doMatch = async () => {
			try {
				const result = await matchProfile(profile);
				setMatchResults(result);
				apiDone.current = true;
				tryNavigate();
			} catch (err) {
				console.error("Match API error:", err);
				apiDone.current = false;
				if (freezeTimer.current) {
					clearTimeout(freezeTimer.current);
					freezeTimer.current = null;
				}
				overlayTarget.current = null;
				setOverlayOpacity(0);
				setContentPhase("error");
			}
		};

		void doMatch();
	}, [profile, setMatchResults, tryNavigate]);

	function handleOverlayTransitionEnd() {
		if (overlayTarget.current === "in" && overlayOpacity === 1) {
			waitingStartTime.current = performance.now();
			setContentPhase("waiting");
			overlayTarget.current = "out";
			requestAnimationFrame(() => setOverlayOpacity(0));
			tryNavigate();
			return;
		}
		if (overlayTarget.current === "out" && overlayOpacity === 0) {
			overlayTarget.current = null;
		}
	}

	return (
		<div className="relative flex flex-col items-center justify-center min-h-[100dvh] px-4 gap-7">
			{contentPhase === "success" && (
				<>
					<LottiePlayer
						src={LOADING_ANIMATION_URLS.highFive}
						onComplete={handleSuccessComplete}
						onReady={() => setSuccessAnimationReady(true)}
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
				onTransitionEnd={handleOverlayTransitionEnd}
				aria-hidden
			/>
		</div>
	);
}
