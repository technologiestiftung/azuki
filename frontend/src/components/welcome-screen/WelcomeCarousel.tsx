import React, { useState, useRef } from "react";
import { content } from "../../content/de";
import { useAppStore } from "../../store/useAppStore";
import { Step } from "../../common";
import { PrimaryButton } from "../primitives/buttons/PrimaryButton";

const slideImages = [
	"/illustrations/binoculars.svg",
	"/illustrations/welcome-star.svg",
	"/illustrations/matching.svg",
	"/illustrations/map.svg",
];

const SWIPE_THRESHOLD = 50;
const TAP_MAX_DURATION = 300;

export function WelcomeCarousel() {
	const [currentSlide, setCurrentSlide] = useState(0);
	const [isPaused, setIsPaused] = useState(false);
	const goToStep = useAppStore((state) => state.goToStep);

	const pointerStartX = useRef<number | null>(null);
	const pointerDownTime = useRef(0);

	const slides = [
		{ title: content["welcome.slide.1.title"] },
		{ title: content["welcome.slide.2.title"] },
		{ title: content["welcome.slide.3.title"] },
		{ title: content["welcome.slide.4.title"] },
	];

	function goToNextSlide() {
		setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
	}

	function goToPrevSlide() {
		setCurrentSlide((prev) => Math.max(prev - 1, 0));
	}

	function advanceSlide() {
		setCurrentSlide((prev) => {
			//go to start step after the last slide
			if (prev >= slides.length - 1) {
				goToStep(Step.Start);
				return prev;
			}
			return prev + 1;
		});
	}

	function handleGetStarted() {
		goToStep(Step.Start);
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

		const navigate = diff > 0 ? goToNextSlide : goToPrevSlide;

		// Swipe detected
		if (Math.abs(diff) > SWIPE_THRESHOLD) {
			navigate();
			return;
		}

		// Long press without swipe → just resume, no navigation
		if (pressDuration >= TAP_MAX_DURATION) {
			return;
		}

		// Short tap: left half → back, right half → forward
		const rect = e.currentTarget.getBoundingClientRect();
		const tapX = e.clientX - rect.left;
		const tapNavigate = tapX < rect.width / 2 ? goToPrevSlide : goToNextSlide;
		tapNavigate();
	}

	function handlePointerCancel() {
		setIsPaused(false);
		pointerStartX.current = null;
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
		if (e.key === "ArrowRight" || e.key === "ArrowDown") {
			e.preventDefault();
			goToNextSlide();
		} else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
			e.preventDefault();
			goToPrevSlide();
		}
	}

	return (
		<div className="flex flex-col min-h-[100dvh] p-4">
			<div className="flex gap-[6px] pb-1">
				{slides.map((slide, index) => {
					const isCurrent = index === currentSlide;
					const isCompleted = index < currentSlide;
					return (
						<button
							key={slide.title}
							type="button"
							onClick={() => {
								setCurrentSlide(index);
							}}
							aria-label={`${content["welcome.slide.ariaLabelPrefix"]} ${index + 1}`}
							className="h-2 flex-1 rounded-full bg-gray-200 overflow-hidden focus-visible:outline-1 focus-visible:outline-sky-500"
						>
							{isCurrent ? (
								<div
									key={currentSlide}
									className="h-full bg-sky-300 animate-progressFill"
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
						</button>
					);
				})}
			</div>

			<div
				role="region"
				aria-roledescription="carousel"
				aria-label={`Slide ${currentSlide + 1} of ${slides.length}`}
				tabIndex={0}
				className="flex-1 flex justify-center touch-none select-none focus-visible:outline-1 focus-visible:outline-sky-500 rounded-lg"
				onPointerDown={handlePointerDown}
				onPointerUp={handlePointerUp}
				onPointerCancel={handlePointerCancel}
				onKeyDown={handleKeyDown}
			>
				<div key={currentSlide} className="flex justify-center animate-slideIn">
					<img
						src={slideImages[currentSlide]}
						alt=""
						className="w-full mb-10 pointer-events-none"
						draggable={false}
					/>
				</div>
			</div>
			<div className="flex flex-col">
				<h1 className="text-4xl font-bold py-6 text-center h-52">
					{slides[currentSlide].title}
				</h1>

				<PrimaryButton onClick={handleGetStarted} className="w-full">
					{content["welcome.cta"]}
				</PrimaryButton>
			</div>
		</div>
	);
}
