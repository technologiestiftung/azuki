import { useCallback, useRef, useState } from "react";
import { content } from "../../../../content/de";
import { useAppStore } from "../../../../store/useAppStore";
import { Step } from "../../../../common";
import { StepLayout } from "../StepLayout";
import { StrengthsSlider } from "./StrengthsSlider";
import { strengths } from "./strengths";
import { SwipeCardStack } from "./SwipeCardStack";
import type { SwipeCardStackHandle, SwipeDirection } from "./SwipeCardStack";
import { StrengthCard } from "./StrengthCard";

export function StrengthsStep() {
	const profile = useAppStore((state) => state.profile);
	const setStrength = useAppStore((state) => state.setStrength);
	const setStrengthSubIndex = useAppStore((state) => state.setStrengthSubIndex);
	const nextStep = useAppStore((state) => state.nextStep);
	const prevStep = useAppStore((state) => state.prevStep);

	const stackRef = useRef<SwipeCardStackHandle>(null);
	const initialIndex = useAppStore.getState().strengthSubIndex;

	const handleCommit = useCallback(
		(index: number): SwipeDirection => {
			const card = strengths[index];
			const value = profile.strengths[card?.id] ?? 0.5;
			return value < 0.5 ? "left" : "right";
		},
		[profile.strengths],
	);

	const handleBack = useCallback(
		(targetIndex: number): SwipeDirection => {
			const card = strengths[targetIndex];
			const value = profile.strengths[card?.id] ?? 0.5;
			return value >= 0.5 ? "right" : "left";
		},
		[profile.strengths],
	);

	const [currentIndex, setCurrentIndex] = useState(initialIndex);

	const handleIndexChange = useCallback(
		(index: number) => {
			setCurrentIndex(index);
			setStrengthSubIndex(index);
		},
		[setStrengthSubIndex],
	);

	const currentCard = strengths[currentIndex];
	const currentValue = profile.strengths[currentCard?.id] ?? 0.5;

	const handleSliderChange = useCallback(
		(value: number) => {
			if (currentCard) {
				setStrength(currentCard.id, value);
			}
		},
		[currentCard, setStrength],
	);

	return (
		<StepLayout
			question={content["strengths.question"]}
			currentStep={Step.Strengths}
			onNext={() => stackRef.current?.goNext("right")}
			onSkip={() => stackRef.current?.goNext("right")}
			onBack={() => stackRef.current?.goBack("left")}
			skipLabel={content["strengths.skipButton.label"]}
		>
			<div className="flex flex-col justify-center items-center h-full flex-1">
				<SwipeCardStack
					ref={stackRef}
					count={strengths.length}
					initialIndex={initialIndex}
					onCommit={handleCommit}
					onAdvance={handleIndexChange}
					onExhausted={nextStep}
					onBefore={prevStep}
					onBack={handleBack}
					onIndexChange={handleIndexChange}
					renderCard={(index: number) => <StrengthCard index={index} />}
				/>
				<div className="w-full mt-4">
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
