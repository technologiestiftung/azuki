import type { DotLottie } from "@lottiefiles/dotlottie-react";
import {
	memo,
	useCallback,
	useEffect,
	useState,
	type ComponentType,
} from "react";
import { loadDotLottie } from "./dotlottieLoader";

type DotLottieReactProps = {
	src: string;
	loop?: boolean;
	autoplay?: boolean;
	dotLottieRefCallback?: (dotLottie: DotLottie | null) => void;
	className?: string;
	"aria-hidden"?: boolean;
};

type LottiePlayerProps = {
	src: string;
	loop?: boolean;
	onComplete?: () => void;
};

export const LottiePlayer = memo(function LottiePlayer({
	src,
	loop = false,
	onComplete,
}: LottiePlayerProps) {
	const [DotLottieReact, setDotLottieReact] =
		useState<ComponentType<DotLottieReactProps> | null>(null);

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
			if (dotLottie && onComplete) {
				dotLottie.addEventListener("complete", onComplete);
			}
		},
		[onComplete],
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
				dotLottieRefCallback={onComplete ? dotLottieRefCallback : undefined}
				className="h-full w-full"
				aria-hidden
			/>
		</div>
	);
});
