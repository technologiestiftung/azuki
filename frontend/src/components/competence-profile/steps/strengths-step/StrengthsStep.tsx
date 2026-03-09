import React, { useState, useRef } from "react";
import { content } from "../../../../content/de";
import { useAppStore } from "../../../../store/useAppStore";
import { Step } from "../../../../common";
import { StepLayout } from "../StepLayout";
import { StrengthsSlider } from "./StrengthsSlider";
import { strengths } from "./strengths";

const EXIT_DURATION = 300;

export function StrengthsStep() {
	const profile = useAppStore((state) => state.profile);
	const setStrength = useAppStore((state) => state.setStrength);
	const setStrengthSubIndex = useAppStore((state) => state.setStrengthSubIndex);
	const nextStep = useAppStore((state) => state.nextStep);
	const prevStep = useAppStore((state) => state.prevStep);

	const [displayIndex, setDisplayIndex] = useState(
		useAppStore.getState().strengthSubIndex,
	);

	const pointerStartX = useRef<number | null>(null);
	const [dragX, setDragX] = useState(0);
	const [isDragging, setIsDragging] = useState(false);
	const [animClass, setAnimClass] = useState("animate-slideInRight");
	const isAnimating = useRef(false);

	const current = strengths[displayIndex];
	const currentValue = profile.strengths[current.id] ?? 0.5;

	function handleSliderChange(value: number) {
		setStrength(current.id, value);
	}

	function handleNext() {
		if (isAnimating.current) {
			return;
		}
		isAnimating.current = true;

		const goesLeft = currentValue < 0.5;
		setAnimClass(goesLeft ? "animate-slideOutLeft" : "animate-slideOutRight");

		setTimeout(() => {
			if (displayIndex < strengths.length - 1) {
				const newIndex = displayIndex + 1;
				setDisplayIndex(newIndex);
				setStrengthSubIndex(newIndex);
				setAnimClass(goesLeft ? "animate-slideInRight" : "animate-slideInLeft");

				setTimeout(() => {
					isAnimating.current = false;
				}, 250);
			} else {
				nextStep();
				isAnimating.current = false;
			}
		}, EXIT_DURATION);
	}

	function handleBack() {
		if (isAnimating.current) {
			return;
		}

		if (displayIndex > 0) {
			isAnimating.current = true;
			setAnimClass("animate-slideOutRight");

			setTimeout(() => {
				const newIndex = displayIndex - 1;
				setDisplayIndex(newIndex);
				setStrengthSubIndex(newIndex);
				setAnimClass("animate-slideInLeft");

				setTimeout(() => {
					isAnimating.current = false;
				}, 250);
			}, EXIT_DURATION);
		} else {
			prevStep();
		}
	}

	function handleSkip() {
		nextStep();
	}

	// Tinder-like swipe handlers
	function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
		pointerStartX.current = e.clientX;
		setIsDragging(true);
	}

	function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
		if (!isDragging || pointerStartX.current === null) {
			return;
		}
		const deltaX = e.clientX - pointerStartX.current;
		setDragX(deltaX);
	}

	function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
		if (!isDragging || pointerStartX.current === null) {
			return;
		}
		const deltaX = e.clientX - pointerStartX.current;
		setIsDragging(false);

		const threshold = 80;
		if (deltaX < -threshold) {
			setDragX(-window.innerWidth); // animate out left
			setTimeout(() => {
				setDragX(0);
				handleNext();
			}, 200);
		} else if (deltaX > threshold) {
			setDragX(window.innerWidth); // animate out right
			setTimeout(() => {
				setDragX(0);
				handleBack();
			}, 200);
		} else {
			setDragX(0); // snap back
		}
		pointerStartX.current = null;
	}

	function handlePointerLeave() {
		setIsDragging(false);
		setDragX(0);
		pointerStartX.current = null;
	}

	return (
		<StepLayout
			question={content["strengths.question"]}
			currentStep={Step.Strengths}
			onNext={handleNext}
			onSkip={handleSkip}
			onBack={handleBack}
			skipLabel={content["strengths.skipButton.label"]}
		>
			<div className="flex flex-col justify-center items-center h-full flex-1">
				<div className="relative w-full">
					{/* Stacked card behind */}
					{displayIndex < strengths.length - 1 && (
						<div
							className="absolute inset-0 -top-10 bg-gray-400 rounded-3xl -scale-[0.85] opacity-60"
							aria-hidden="true"
						/>
					)}

					{/* Active card */}
					<div
						key={current.id}
						className={`relative w-full bg-gray-200 rounded-3xl p-6 flex flex-col items-center ${animClass}`}
						onPointerDown={handlePointerDown}
						onPointerMove={handlePointerMove}
						onPointerUp={handlePointerUp}
						onPointerLeave={handlePointerLeave}
						style={{
							touchAction: "pan-y",
							cursor: isDragging ? "grabbing" : "grab",
							transform: `translateX(${dragX}px) rotate(${dragX / 20}deg)`,
							transition: isDragging
								? "none"
								: "transform 0.2s cubic-bezier(.22,.68,0,1.71)",
						}}
					>
						<img
							src={current.illustration}
							alt=""
							className="w-32 h-32 object-contain mb-2"
						/>
						<h3 className="text-gray-700 text-xl leading-6 font-semibold">
							{current.title}
						</h3>
						<p className="text-base text-gray-700 text-center">
							{current.description}
						</p>
					</div>
				</div>
				{/* Slider */}
				<div className="w-full">
					<div className="flex justify-between text-base font-medium text-gray-600 mb-2">
						<span>{content["strengths.sliderMin"]}</span>
						<span>{content["strengths.sliderMax"]}</span>
					</div>
					<StrengthsSlider value={currentValue} onChange={handleSliderChange} />
				</div>
			</div>
		</StepLayout>
	);
}
