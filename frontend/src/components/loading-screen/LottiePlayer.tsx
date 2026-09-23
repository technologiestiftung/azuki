import type { DotLottie } from "@lottiefiles/dotlottie-react";
import {
	memo,
	useCallback,
	useEffect,
	useRef,
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

	const onCompleteRef = useRef(onComplete);
	const onReadyRef = useRef(onReady);
	useEffect(() => {
		onCompleteRef.current = onComplete;
		onReadyRef.current = onReady;
	});

	const instance = useRef<DotLottie | null>(null);
	const removeListeners = useRef<(() => void) | null>(null);

	const dotLottieRefCallback = useCallback(
		(dotLottie: DotLottie | null) => {
			if (instance.current === dotLottie) {
				return;
			}
			removeListeners.current?.();
			removeListeners.current = null;
			instance.current = dotLottie;

			if (!dotLottie) {
				return;
			}

			const onLoad = () => {
				if (loop) {
					const end = Math.ceil(dotLottie.totalFrames) - 1;
					dotLottie.setSegment(0, end);
				}
				onReadyRef.current?.();
			};
			const handleComplete = () => onCompleteRef.current?.();

			dotLottie.addEventListener("load", onLoad);
			dotLottie.addEventListener("complete", handleComplete);
			removeListeners.current = () => {
				dotLottie.removeEventListener("load", onLoad);
				dotLottie.removeEventListener("complete", handleComplete);
			};

			if (dotLottie.isLoaded) {
				onLoad();
			}
		},
		[loop],
	);

	useEffect(() => {
		return () => {
			removeListeners.current?.();
			removeListeners.current = null;
			instance.current = null;
		};
	}, []);

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
