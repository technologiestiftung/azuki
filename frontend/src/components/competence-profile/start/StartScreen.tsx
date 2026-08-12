import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { content } from "../../../content";
import { useFlowNavigation } from "../../../routing/useFlowNavigation";
import { shouldPrefillProfile } from "../../../profile/prefillConfig";
import { GhostButton } from "../../primitives/buttons/GhostButton";
import { StartCtaButton } from "./StartCtaButton";
import { StartHeroIllustration } from "./StartHeroIllustration";

interface Slide {
	image: string;
	title: string;
	description: string | null;
	cta: string;
	imageAlign: "items-end" | "items-center";
}

const slides: Slide[] = [
	{
		image: "/illustrations/welcome-star.svg",
		title: content["start.step1.title"],
		description: null,
		cta: content["start.step1.cta.label"],
		imageAlign: "items-end",
	},
	{
		image: "/illustrations/clipboard.svg",
		title: content["start.step2.title"],
		description: content["start.step2.description"],
		cta: content["start.step2.cta.label"],
		imageAlign: "items-center",
	},
];

const SLIDE_COUNT = slides.length;
const SWIPE_THRESHOLD = 50;
const TAP_MAX_DURATION = 300;

function isSlideVisible(
	index: number,
	current: number,
	previous: number | null,
) {
	return index === current || index === previous;
}

function useSlideCarousel(slideCount: number) {
	const [currentSlide, setCurrentSlide] = useState(0);
	const [previousSlide, setPreviousSlide] = useState<number | null>(null);
	const [slideDirection, setSlideDirection] = useState<"next" | "prev" | null>(
		null,
	);

	const [clipboardPlayKey, setClipboardPlayKey] = useState(0);

	function moveSlide(direction: "next" | "prev") {
		if (direction === "next" && currentSlide >= slideCount - 1) {
			return;
		}
		if (direction === "prev" && currentSlide === 0) {
			return;
		}

		const nextIndex =
			direction === "next" ? currentSlide + 1 : currentSlide - 1;
		if (nextIndex === 1) {
			setClipboardPlayKey((key) => key + 1);
		}
		setPreviousSlide(currentSlide);
		setSlideDirection(direction);
		setCurrentSlide(nextIndex);
	}

	return {
		currentSlide,
		previousSlide,
		slideDirection,
		clipboardPlayKey,
		moveSlide,
	};
}

function useSwipeNavigation(onMove: (direction: "next" | "prev") => void) {
	const pointerStartX = useRef<number | null>(null);
	const pointerDownTime = useRef(0);

	function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
		pointerStartX.current = e.clientX;
		pointerDownTime.current = Date.now();
		e.currentTarget.setPointerCapture(e.pointerId);
	}

	function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
		if (pointerStartX.current === null) {
			return;
		}

		const diff = pointerStartX.current - e.clientX;
		const pressDuration = Date.now() - pointerDownTime.current;
		pointerStartX.current = null;

		if (Math.abs(diff) > SWIPE_THRESHOLD) {
			onMove(diff > 0 ? "next" : "prev");
			return;
		}

		if (pressDuration >= TAP_MAX_DURATION) {
			return;
		}

		const rect = e.currentTarget.getBoundingClientRect();
		const tapX = e.clientX - rect.left;
		onMove(tapX < rect.width / 2 ? "prev" : "next");
	}

	function onPointerCancel() {
		pointerStartX.current = null;
	}

	function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
		if (e.key === "ArrowRight" || e.key === "ArrowDown") {
			e.preventDefault();
			onMove("next");
		} else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
			e.preventDefault();
			onMove("prev");
		}
	}

	return {
		onPointerDown,
		onPointerUp,
		onPointerCancel,
		onKeyDown,
	};
}

export function StartScreen() {
	const navigate = useNavigate();
	const { goNext } = useFlowNavigation();
	const {
		currentSlide,
		previousSlide,
		slideDirection,
		clipboardPlayKey,
		moveSlide,
	} = useSlideCarousel(SLIDE_COUNT);
	const swipeHandlers = useSwipeNavigation(moveSlide);

	function handleNext() {
		if (currentSlide >= SLIDE_COUNT - 1) {
			goNext();
			return;
		}
		moveSlide("next");
	}

	const activeSlide = slides[currentSlide];

	return (
		<div className="flex flex-col h-[100dvh] pt-4 overflow-hidden min-h-0 bg-sky-100">
			<div className="flex-1 min-h-0 flex flex-col">
				<div className="flex-1 min-h-0 relative overflow-hidden">
					<StartHeroIllustration
						currentSlide={currentSlide}
						previousSlide={previousSlide}
						direction={slideDirection}
						clipboardPlayKey={clipboardPlayKey}
						star={slides[0]}
						clipboard={slides[1]}
					/>
				</div>
				<div className="relative z-10 animate-startSheetEnter bg-sky-white rounded-t-4xl">
					<div className="flex flex-col gap-3 pt-6">
						<div
							role="region"
							aria-roledescription="carousel"
							aria-label={`${currentSlide + 1} / ${SLIDE_COUNT}`}
							tabIndex={0}
							className="relative overflow-hidden text-sky-900 h-44 touch-none select-none focus-visible:outline-1 focus-visible:outline-sky-500 rounded-[7px] animate-startSheetContentFade"
							{...swipeHandlers}
						>
							{slides.map((slide, index) => {
								if (!isSlideVisible(index, currentSlide, previousSlide)) {
									return null;
								}

								let animationClass = "";
								if (slideDirection === "next") {
									animationClass =
										index === currentSlide
											? "animate-slideInNext"
											: "animate-slideOutPrev";
								} else if (slideDirection === "prev") {
									animationClass =
										index === currentSlide
											? "animate-slideInPrev"
											: "animate-slideOutNext";
								}

								return (
									<div
										key={index}
										className={`absolute inset-0 flex flex-col gap-3 px-5 ${animationClass}`}
										style={{ zIndex: index === currentSlide ? 10 : 0 }}
									>
										<h1 className="text-4xl font-extrabold text-center">
											{slide.title}
										</h1>
										{slide.description ? (
											<p className="text-xl font-normal text-center px-4">
												{slide.description}
											</p>
										) : null}
									</div>
								);
							})}
						</div>

						<div className="flex justify-center items-end px-2 w-full h-6">
							<div className="h-[5px] flex gap-1.5 items-center justify-center w-full rounded-full overflow-hidden">
								{slides.map((_, index) => (
									<div
										key={index}
										className={`h-full rounded-full transition-all duration-500 ease-spring ${
											index === currentSlide
												? "w-6 bg-sky-300"
												: "w-3 bg-gray-200"
										}`}
									/>
								))}
							</div>
						</div>
					</div>
					<div className="bg-sky-white animate-startSheetCtaEnter">
						<div className="w-full flex flex-col px-4 pb-4 pt-4 gap-y-2 max-w-[430px] mx-auto">
							<StartCtaButton
								activeCta={activeSlide.cta}
								previousCta={
									previousSlide !== null ? slides[previousSlide].cta : null
								}
								direction={slideDirection}
								onClick={handleNext}
							/>
							{shouldPrefillProfile && (
								<GhostButton
									onClick={() => navigate("/loading")}
									className="w-full"
								>
									{content["start.cta.prefill"]}
								</GhostButton>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
