import { useState, useEffect, useCallback } from "react";
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

const AUTO_ADVANCE_MS = 3000;

export function WelcomeCarousel() {
	const [currentSlide, setCurrentSlide] = useState(0);
	const goToStep = useAppStore((state) => state.goToStep);

	const slides = [
		{ title: content["welcome.slide.1.title"] },
		{ title: content["welcome.slide.2.title"] },
		{ title: content["welcome.slide.3.title"] },
		{ title: content["welcome.slide.4.title"] },
	];

	const advanceSlide = useCallback(() => {
		setCurrentSlide((prev) => (prev + 1) % slides.length);
	}, [slides.length]);

	useEffect(() => {
		const timer = setInterval(advanceSlide, AUTO_ADVANCE_MS);
		return () => clearInterval(timer);
	}, [advanceSlide]);

	function handleCta() {
		goToStep(Step.Start);
	}

	return (
		<div className="flex flex-col min-h-[100dvh]">
			<div className="flex gap-1 px-4 pt-2 pb-1">
				{slides.map((_, i) => (
					<div
						key={i}
						className="h-1 flex-1 rounded-full transition-colors duration-300"
						style={{
							backgroundColor: i <= currentSlide ? "#38bdf8" : "#e5e7eb",
						}}
					/>
				))}
			</div>

			<div className="flex-1 flex flex-col items-center justify-center px-8">
				<div
					key={currentSlide}
					className="flex flex-col items-center text-center animate-slideIn"
				>
					<img
						src={slideImages[currentSlide]}
						alt=""
						className="w-56 h-56 object-contain mb-10"
					/>
					<h1 className="text-h2 font-bold">{slides[currentSlide].title}</h1>
				</div>
			</div>

			<div className="px-4 pb-8">
				<PrimaryButton onClick={handleCta} className="w-full">
					{content["welcome.cta"]}
				</PrimaryButton>
			</div>
		</div>
	);
}
