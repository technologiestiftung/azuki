import { useState } from "react";
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

export function WelcomeCarousel() {
	const [currentSlide, setCurrentSlide] = useState(0);
	const goToStep = useAppStore((state) => state.goToStep);

	const slides = [
		{ title: content["welcome.slide.1.title"] },
		{ title: content["welcome.slide.2.title"] },
		{ title: content["welcome.slide.3.title"] },
		{ title: content["welcome.slide.4.title"] },
	];

	function advanceSlide() {
		setCurrentSlide((prev) => (prev + 1) % slides.length);
	}

	function handleGetStarted() {
		goToStep(Step.Start);
	}

	return (
		<div className="flex flex-col h-[100dvh] p-4 min-h-0 overflow-y-auto">
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
				key={currentSlide}
				className="flex-1 flex justify-center animate-slideIn"
			>
				<img src={slideImages[currentSlide]} alt="" className="w-full mb-10" />
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
