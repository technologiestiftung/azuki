import type { DotLottie } from "@lottiefiles/dotlottie-react";
import {
	memo,
	useCallback,
	useEffect,
	useState,
	type ComponentType,
} from "react";
import { getLoadedDotLottie, loadDotLottie } from "./dotlottieLoader";

const CANVAS_BG = "#fafdff";

type DotLottieReactProps = {
	src: string;
	loop?: boolean;
	autoplay?: boolean;
	backgroundColor?: string;
	dotLottieRefCallback?: (dotLottie: DotLottie | null) => void;
	className?: string;
	"aria-hidden"?: boolean;
};

type LottiePlayerProps = {
	src: string;
	loop?: boolean;
	onComplete?: () => void;
	onReady?: () => void;
};

export const LottiePlayer = memo(function LottiePlayer({
	src,
	loop = false,
	onComplete,
	onReady,
}: LottiePlayerProps) {
	const [DotLottieReact, setDotLottieReact] =
		useState<ComponentType<DotLottieReactProps> | null>(
			() => getLoadedDotLottie()?.DotLottieReact ?? null,
		);

	useEffect(() => {
		let cancelled = false;

		void loadDotLottie().then((mod) => {
			if (!cancelled) {
				setDotLottieReact(() => mod.DotLottieReact);
			}
		});

		return () => {
			cancelled = true;
		};
	}, []);

	const dotLottieRefCallback = useCallback(
		(dotLottie: DotLottie | null) => {
			if (!dotLottie) {
				return;
			}

			const onLoad = () => {
				if (loop) {
					const end = Math.ceil(dotLottie.totalFrames) - 1;
					dotLottie.setSegment(0, end);
				}
				onReady?.();
			};

			dotLottie.addEventListener("load", onLoad);
			if (dotLottie.isLoaded) {
				onLoad();
			}

			if (onComplete) {
				dotLottie.addEventListener("complete", onComplete);
			}
		},
		[loop, onComplete, onReady],
	);

	if (!DotLottieReact) {
		return <div className="h-[250px] w-full" aria-hidden />;
	}

	return (
		<div className="h-[250px] w-full">
			<DotLottieReact
				src={src}
				loop={loop}
				autoplay
				backgroundColor={CANVAS_BG}
				dotLottieRefCallback={dotLottieRefCallback}
				className="h-full w-full"
				aria-hidden
			/>
		</div>
	);
});
