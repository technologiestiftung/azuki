import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { content } from "../../content";
import { useAppStore } from "../../store/useAppStore";
import { useMatchResultsStore } from "../../store/useMatchResultsStore";
import { matchProfile } from "../../api/client";
import { LoadingProgressBar } from "./LoadingProgressBar";
import { LottiePlayer } from "./LottiePlayer";

const HIGH_FIVE_LOTTIE = "/animations/high-five.lottie";
const LOOP_LOTTIE = "/animations/loop.lottie";

const SUCCESS_FREEZE_MS = 3200;
const WHITE_FADE_MS = 400;
const LOADING_MIN_MS = 40_000;

type ContentPhase = "success" | "waiting";

export function LoadingScreen() {
	const profile = useAppStore((state) => state.profile);
	const matchResults = useMatchResultsStore((state) => state.matchResults);
	const setMatchResults = useMatchResultsStore(
		(state) => state.setMatchResults,
	);
	const navigate = useNavigate();
	const called = useRef(false);
	const apiDone = useRef(false);
	const waitingMinDone = useRef(false);
	const [contentPhase, setContentPhase] = useState<ContentPhase>("success");
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
		if (apiDone.current && waitingMinDone.current) {
			navigate("/results/list");
		}
	}, [navigate]);

	const handleSuccessComplete = useCallback(() => {
		freezeTimer.current = setTimeout(startTransition, SUCCESS_FREEZE_MS);
	}, []);

	const handleWaitingProgressComplete = useCallback(() => {
		waitingMinDone.current = true;
		tryNavigate();
	}, [tryNavigate]);

	useEffect(() => {
		return () => {
			if (freezeTimer.current) {
				clearTimeout(freezeTimer.current);
			}
		};
	}, []);

	useEffect(() => {
		if (matchResults) {
			navigate("/results/list", { replace: true });
			return;
		}
		if (called.current) {
			return;
		}
		called.current = true;

		const doMatch = async () => {
			try {
				const result = await matchProfile(profile);
				setMatchResults(result);
			} catch (err) {
				console.error("Match API error:", err);
			} finally {
				apiDone.current = true;
				tryNavigate();
			}
		};

		void doMatch();
	}, [profile, matchResults, setMatchResults, navigate, tryNavigate]);

	function handleOverlayTransitionEnd() {
		if (overlayTarget.current === "in" && overlayOpacity === 1) {
			setContentPhase("waiting");
			overlayTarget.current = "out";
			requestAnimationFrame(() => setOverlayOpacity(0));
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
						src={HIGH_FIVE_LOTTIE}
						onComplete={handleSuccessComplete}
					/>
					<div className="flex flex-col items-center justify-center gap-3 px-4">
						<h2 className="text-4xl leading-[120%] font-bold text-center">
							{content["loading.success.title"]}
						</h2>
						<p className="text-xl font-normal text-center">
							{content["loading.success.description"]}
						</p>
					</div>
				</>
			)}

			{contentPhase === "waiting" && (
				<>
					<LottiePlayer src={LOOP_LOTTIE} loop />
					<div className="flex flex-col items-center justify-center gap-3 px-4">
						<h2 className="text-4xl leading-[120%] font-bold text-center">
							{content["loading.waiting.title"]}
						</h2>
						<p className="text-xl font-normal text-center">
							{content["loading.waiting.description"]}
						</p>
					</div>
					<LoadingProgressBar
						durationMs={LOADING_MIN_MS}
						onComplete={handleWaitingProgressComplete}
					/>
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
