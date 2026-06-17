import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { content } from "../../content";
import { useAppStore } from "../../store/useAppStore";
import { useMatchResultsStore } from "../../store/useMatchResultsStore";
import { matchProfile } from "../../api/client";

const Lottie = lazy(() => import("lottie-react"));

const SUCCESS_FREEZE_MS = 3200;
const WHITE_FADE_MS = 400;
const LOADING_MIN_MS = 40_000;

type ContentPhase = "success" | "waiting";
type LottieAnimation = object;

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
	const [progress, setProgress] = useState(0);
	const [successAnimation, setSuccessAnimation] =
		useState<LottieAnimation | null>(null);
	const [loadingAnimation, setLoadingAnimation] =
		useState<LottieAnimation | null>(null);
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

	function handleSuccessComplete() {
		void import("./loading.json").then((mod) => {
			setLoadingAnimation(mod.default);
		});
		freezeTimer.current = setTimeout(startTransition, SUCCESS_FREEZE_MS);
	}

	function tryNavigate() {
		if (apiDone.current && waitingMinDone.current) {
			navigate("/results/list");
		}
	}

	useEffect(() => {
		let cancelled = false;
		void import("./success.json").then((mod) => {
			if (!cancelled) {
				setSuccessAnimation(mod.default);
			}
		});
		return () => {
			cancelled = true;
		};
	}, []);

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
	}, [profile, matchResults, setMatchResults, navigate]);

	useEffect(() => {
		if (contentPhase !== "waiting" || loadingAnimation) {
			return undefined;
		}

		let cancelled = false;
		void import("./loading.json").then((mod) => {
			if (!cancelled) {
				setLoadingAnimation(mod.default);
			}
		});
		return () => {
			cancelled = true;
		};
	}, [contentPhase, loadingAnimation]);

	useEffect(() => {
		if (contentPhase !== "waiting") {
			return undefined;
		}

		const start = performance.now();
		let frame = 0;

		const tick = (now: number) => {
			const elapsed = now - start;
			if (elapsed >= LOADING_MIN_MS) {
				setProgress(1);
				waitingMinDone.current = true;
				tryNavigate();
				return;
			}
			setProgress(elapsed / LOADING_MIN_MS);
			frame = requestAnimationFrame(tick);
		};

		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, [contentPhase]);

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
					{successAnimation && (
						<Suspense fallback={null}>
							<Lottie
								animationData={successAnimation}
								loop={false}
								onComplete={handleSuccessComplete}
								className="w-full"
								aria-hidden
							/>
						</Suspense>
					)}
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
					{loadingAnimation && (
						<Suspense fallback={null}>
							<Lottie
								animationData={loadingAnimation}
								loop
								className="w-full"
								aria-hidden
							/>
						</Suspense>
					)}
					<div className="flex flex-col items-center justify-center gap-3 px-4">
						<h2 className="text-4xl leading-[120%] font-bold text-center">
							{content["loading.waiting.title"]}
						</h2>
						<p className="text-xl font-normal text-center">
							{content["loading.waiting.description"]}
						</p>
					</div>
					<div
						className="h-2 w-full rounded-full bg-gray-200 overflow-hidden"
						role="progressbar"
						aria-valuenow={Math.round(progress * 100)}
						aria-valuemin={0}
						aria-valuemax={100}
					>
						<div
							className="h-full bg-sky-300 rounded-full"
							style={{
								width: `${progress * 100}%`,
							}}
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
