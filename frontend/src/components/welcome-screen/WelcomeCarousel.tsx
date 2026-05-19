import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { content } from "../../content";
import { PrimaryThemedButton } from "../primitives/buttons/PrimaryThemedButton";

const slideImages = [
	"/illustrations/binoculars.svg",
	"/illustrations/welcome-star.svg",
	"/illustrations/matching.svg",
	"/illustrations/map.svg",
];

const SLIDE_COUNT = slideImages.length;

const SWIPE_THRESHOLD = 50;
const TAP_MAX_DURATION = 300;
const KEYBOARD_PAUSE_DURATION = 300;

export function WelcomeCarousel() {
	const [currentSlide, setCurrentSlide] = useState(0);
	const [previousSlide, setPreviousSlide] = useState<number | null>(null);
	const [slideDirection, setSlideDirection] = useState<"next" | "prev" | null>(
		null,
	);
	const [isPaused, setIsPaused] = useState(false);
	const navigateTo = useNavigate();

	const pointerStartX = useRef<number | null>(null);
	const pointerDownTime = useRef(0);
	const keyboardPauseTimeout = useRef<ReturnType<typeof setTimeout> | null>(
		null,
	);

	function moveSlide(direction: "next" | "prev") {
		if (direction === "next" && currentSlide >= SLIDE_COUNT - 1) {
			navigateTo("/start");
			return;
		}
		if (direction === "prev" && currentSlide === 0) {
			return;
		}
		setPreviousSlide(currentSlide);
		setSlideDirection(direction);
		setCurrentSlide((prev) => (direction === "next" ? prev + 1 : prev - 1));
	}

	function advanceSlide() {
		moveSlide("next");
	}

	function handleGetStarted() {
		navigateTo("/start");
	}

	function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
		pointerStartX.current = e.clientX;
		pointerDownTime.current = Date.now();
		setIsPaused(true);
		e.currentTarget.setPointerCapture(e.pointerId);
	}

	function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
		setIsPaused(false);
		if (pointerStartX.current === null) {
			return;
		}

		const diff = pointerStartX.current - e.clientX;
		const pressDuration = Date.now() - pointerDownTime.current;
		pointerStartX.current = null;

		if (Math.abs(diff) > SWIPE_THRESHOLD) {
			moveSlide(diff > 0 ? "next" : "prev");
			return;
		}

		if (pressDuration >= TAP_MAX_DURATION) {
			return;
		}

		const rect = e.currentTarget.getBoundingClientRect();
		const tapX = e.clientX - rect.left;
		moveSlide(tapX < rect.width / 2 ? "prev" : "next");
	}

	function handlePointerCancel() {
		setIsPaused(false);
		pointerStartX.current = null;
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
		if (e.key === "ArrowRight" || e.key === "ArrowDown") {
			e.preventDefault();
			setIsPaused(true);
			moveSlide("next");
			if (keyboardPauseTimeout.current) {
				clearTimeout(keyboardPauseTimeout.current);
			}
			keyboardPauseTimeout.current = setTimeout(
				() => setIsPaused(false),
				KEYBOARD_PAUSE_DURATION,
			);
		} else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
			e.preventDefault();
			setIsPaused(true);
			moveSlide("prev");
			if (keyboardPauseTimeout.current) {
				clearTimeout(keyboardPauseTimeout.current);
			}
			keyboardPauseTimeout.current = setTimeout(
				() => setIsPaused(false),
				KEYBOARD_PAUSE_DURATION,
			);
		}
	}

	return (
		<div className="flex flex-col h-[100dvh] py-4 overflow-hidden">
			<div
				role="region"
				aria-roledescription="carousel"
				aria-label={content["welcome.carousel.ariaLabel"]
					.replace("{current}", String(currentSlide + 1))
					.replace("{total}", String(SLIDE_COUNT))}
				tabIndex={0}
				className="flex-1 min-h-0 flex flex-col touch-none select-none focus-visible:outline-1 focus-visible:outline-sky-500 rounded-[7px]"
				onPointerDown={handlePointerDown}
				onPointerUp={handlePointerUp}
				onPointerCancel={handlePointerCancel}
				onKeyDown={handleKeyDown}
			>
				<div className="flex gap-[6px] pb-1 shrink-0 px-4">
					{Array.from({ length: SLIDE_COUNT }, (_, index) => {
						const isCurrent = index === currentSlide;
						const isCompleted = index < currentSlide;
						return (
							<div
								key={index}
								aria-label={`${content["welcome.slide.ariaLabelPrefix"]} ${index + 1}`}
								className="h-2 flex-1 rounded-full bg-gray-200 overflow-hidden"
							>
								{isCurrent ? (
									<div
										key={currentSlide}
										className="h-full bg-sky-300 animate-progressFill rounded-[7px]"
										style={{
											animationPlayState: isPaused ? "paused" : "running",
										}}
										onAnimationEnd={advanceSlide}
									/>
								) : (
									<div
										className={`h-full bg-sky-300 ${isCompleted ? "w-full" : "w-0"}`}
									/>
								)}
							</div>
						);
					})}
				</div>

				<div className="flex-1 min-h-0 relative overflow-hidden">
					{Array.from({ length: SLIDE_COUNT }, (_, index) => {
						if (index !== currentSlide && index !== previousSlide) {
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
								className={`absolute inset-0 flex flex-col ${animationClass}`}
								style={{ zIndex: index === currentSlide ? 10 : 0 }}
							>
								<div className="flex-1 min-h-0 flex justify-center items-center">
									<img
										src={slideImages[index]}
										alt=""
										className="max-h-full w-auto max-w-full object-contain pointer-events-none"
										draggable={false}
									/>
								</div>
								<div className="shrink-0 flex flex-col justify-end px-4">
									<h1 className="text-4xl font-bold py-6 text-center h-52">
										{
											content[
												`welcome.slide.${index + 1}.title` as keyof typeof content
											] as string
										}
									</h1>
								</div>
							</div>
						);
					})}
				</div>
			</div>
			<div className="px-4">
				<PrimaryThemedButton onClick={handleGetStarted} className="w-full">
					{content["welcome.cta"]}
				</PrimaryThemedButton>
			</div>
		</div>
	);
}
