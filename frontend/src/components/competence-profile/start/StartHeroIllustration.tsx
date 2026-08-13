import { useLayoutEffect, useRef } from "react";

const ILLUSTRATION_CROSS_MS = 500;

export interface StartHeroIllustrationAsset {
	image: string;
	imageAlign: "items-end" | "items-center";
}

interface StartHeroIllustrationProps {
	currentSlide: number;
	previousSlide: number | null;
	direction: "next" | "prev" | null;
	clipboardPlayKey: number;
	star: StartHeroIllustrationAsset;
	clipboard: StartHeroIllustrationAsset;
}

function getSpringEasing(el: Element) {
	return (
		getComputedStyle(el).getPropertyValue("--ease-spring").trim() || "ease-out"
	);
}

export function StartHeroIllustration({
	currentSlide,
	previousSlide,
	direction,
	clipboardPlayKey,
	star,
	clipboard,
}: StartHeroIllustrationProps) {
	const starRef = useRef<HTMLDivElement>(null);
	const clipboardRef = useRef<HTMLDivElement>(null);
	const isFirstLoad = previousSlide === null;

	useLayoutEffect(() => {
		if (previousSlide === null || direction === null) {
			return undefined;
		}

		const outgoing =
			previousSlide === 0 ? starRef.current : clipboardRef.current;
		const incoming =
			currentSlide === 0 ? starRef.current : clipboardRef.current;
		if (!outgoing || !incoming) {
			return undefined;
		}

		const easing = getSpringEasing(outgoing);
		const outgoingAnimation = outgoing.animate(
			[{ transform: "translateY(0)" }, { transform: "translateY(100%)" }],
			{ duration: ILLUSTRATION_CROSS_MS, easing, fill: "forwards" },
		);
		const incomingAnimation = incoming.animate(
			[{ transform: "translateY(100%)" }, { transform: "translateY(0)" }],
			{ duration: ILLUSTRATION_CROSS_MS, easing, fill: "forwards" },
		);

		return () => {
			outgoingAnimation.commitStyles();
			incomingAnimation.commitStyles();
			outgoingAnimation.cancel();
			incomingAnimation.cancel();
		};
	}, [currentSlide, previousSlide, direction]);

	return (
		<div className="absolute inset-0 overflow-hidden bg-sky-100">
			<div
				ref={starRef}
				className="absolute inset-0"
				style={{ zIndex: currentSlide === 0 ? 2 : 1 }}
			>
				<div
					className={`flex h-full w-full px-4 ${star.imageAlign} justify-center ${
						isFirstLoad ? "animate-welcomeStarRise" : ""
					}`}
				>
					<img
						src={star.image}
						alt=""
						className={`max-h-full max-w-full object-contain pointer-events-none ${
							isFirstLoad ? "animate-welcomeStarFade" : ""
						}`}
						draggable={false}
					/>
				</div>
			</div>

			<div
				ref={clipboardRef}
				className="absolute inset-0"
				style={{
					zIndex: currentSlide === 1 ? 2 : 1,
					...(isFirstLoad ? { transform: "translateY(100%)" } : {}),
				}}
				aria-hidden={currentSlide !== 1}
			>
				{clipboardPlayKey > 0 ? (
					<div
						key={clipboardPlayKey}
						className={`flex h-full w-full px-4 ${clipboard.imageAlign} justify-center`}
					>
						<img
							src={`${clipboard.image}?v=${clipboardPlayKey}`}
							alt=""
							className="max-h-full max-w-full object-contain pointer-events-none"
							draggable={false}
						/>
					</div>
				) : null}
			</div>
		</div>
	);
}
