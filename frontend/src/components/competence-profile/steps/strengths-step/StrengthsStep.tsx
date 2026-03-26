import { useCallback, useRef } from "react";
import { content } from "../../../../content/de";
import { useAppStore } from "../../../../store/useAppStore";
import { Step } from "../../../../common";
import { StepLayout } from "../StepLayout";
import { StrengthsSlider } from "./StrengthsSlider";
import { strengths } from "./strengths";
import { SwipeCardStack } from "../../../primitives/swipe-card-stack/SwipeCardStack";
import type {
	SwipeCardStackHandle,
	SwipeDirection,
} from "../../../primitives/swipe-card-stack/SwipeCardStack";
import { SwipeCard } from "../../../primitives/swipe-card-stack/SwipeCard";

export function StrengthsStep() {
	const strengthValues = useAppStore((state) => state.profile.strengths);
	const setStrength = useAppStore((state) => state.setStrength);
	const setStrengthSubIndex = useAppStore((state) => state.setStrengthSubIndex);
	const nextStep = useAppStore((state) => state.nextStep);
	const prevStep = useAppStore((state) => state.prevStep);

	const stackRef = useRef<SwipeCardStackHandle>(null);
	const initialIndexValue = useAppStore((state) => state.strengthSubIndex);
	const initialIndex = useRef(initialIndexValue).current;

	const currentIndex = useAppStore((state) => state.strengthSubIndex);

	const getDirectionForIndex = useCallback(
		(index: number): SwipeDirection => {
			const card = strengths[index];
			const value = strengthValues[card?.id] ?? 0.5;
			return value >= 0.5 ? "right" : "left";
		},
		[strengthValues],
	);

	const handleIndexChange = useCallback(
		(index: number) => {
			setStrengthSubIndex(index);
		},
		[setStrengthSubIndex],
	);

	const currentCard = strengths[currentIndex];
	const currentValue = strengthValues[currentCard?.id] ?? 0.5;

	const handleSliderChange = useCallback(
		(value: number) => {
			if (currentCard) {
				setStrength(currentCard.id, value);
			}
		},
		[currentCard, setStrength],
	);

	const handleSkip = useCallback(() => {
		if (currentCard) {
			setStrength(currentCard.id, 0.5);
		}
		stackRef.current?.goNext();
	}, [currentCard, setStrength]);

	return (
		<StepLayout
			question={content["strengths.question"]}
			currentStep={Step.Strengths}
			onNext={() => stackRef.current?.goNext()}
			onSkip={handleSkip}
			onBack={() => stackRef.current?.goBack()}
			hasSkipButton={true}
			skipLabel={content["strengths.skipButton.label"]}
			bottomContent={
				<StrengthsSlider
					value={currentValue}
					onChange={handleSliderChange}
					minLabel={content["strengths.sliderMin"]}
					maxLabel={content["strengths.sliderMax"]}
				/>
			}
		>
			<div className="flex flex-col justify-center items-center h-[85%] flex-1">
				<SwipeCardStack
					ref={stackRef}
					count={strengths.length}
					initialIndex={initialIndex}
					onCommit={getDirectionForIndex}
					onExhausted={nextStep}
					onBefore={prevStep}
					onBack={getDirectionForIndex}
					onIndexChange={handleIndexChange}
					renderCard={(index: number) => (
						<SwipeCard index={index} cards={strengths} minHeight={202} />
					)}
				/>
			</div>
		</StepLayout>
	);
}
