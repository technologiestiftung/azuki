import { useRef, useCallback } from "react";
import { content } from "../../../../content/de";
import { useAppStore } from "../../../../store/useAppStore";
import { Step } from "../../../../common";
import type { NoGoAnswer } from "@azuki/shared";
import { StepLayout } from "../StepLayout";
import { noGos } from "./no-gos";
import { SwipeCardStack } from "../../../primitives/swipe-card-stack/SwipeCardStack";
import type {
	SwipeCardStackHandle,
	SwipeDirection,
} from "../../../primitives/swipe-card-stack/SwipeCardStack";
import { SwipeCard } from "../../../primitives/swipe-card-stack/SwipeCard";
import { NoGoActionButtons } from "./NoGoActionButtons";

export function NoGosStep() {
	const stackRef = useRef<SwipeCardStackHandle>(null);
	const initialIndexValue = useAppStore((state) => state.noGoSubIndex);
	const initialIndex = useRef(initialIndexValue).current;

	const setNoGo = useAppStore(
		(state) => state.setNoGo as (id: string, answer: NoGoAnswer | null) => void,
	);
	const nextStep = useAppStore((state) => state.nextStep);
	const prevStep = useAppStore((state) => state.prevStep);
	const noGosValues = useAppStore((state) => state.profile.noGos);
	const setNoGoSubIndex = useAppStore((state) => state.setNoGoSubIndex);

	const getDirectionForIndex = useCallback(
		(index: number): SwipeDirection => {
			const card = noGos[index];
			const value: NoGoAnswer = noGosValues[card?.id] ?? "accepted";
			return value === "accepted" ? "right" : "left";
		},
		[noGosValues],
	);

	const handleIndexChange = useCallback(
		(index: number) => {
			setNoGoSubIndex(index);
		},
		[setNoGoSubIndex],
	);

	const handleSwipe = useCallback(
		(direction: SwipeDirection, index: number) => {
			const card = noGos[index];
			if (card) {
				const answer: NoGoAnswer =
					direction === "right" ? "accepted" : "rejected";
				setNoGo(card.id, answer);
			}
		},
		[setNoGo],
	);

	const currentIndex = useAppStore((state) => state.noGoSubIndex);

	const handleSkip = useCallback(() => {
		const card = noGos[currentIndex];
		if (card) {
			setNoGo(card.id, null);
		}
		stackRef.current?.goNext();
	}, [currentIndex, setNoGo]);

	return (
		<StepLayout
			question={content["noGos.question"]}
			currentStep={Step.NoGos}
			onNext={() => stackRef.current?.goNext()}
			onSkip={handleSkip}
			onBack={() => stackRef.current?.goBack()}
			hasSkipButton={true}
			hasNextButton={false}
			skipLabel={content["noGos.skipButton.label"]}
			bottomContent={
				<NoGoActionButtons
					onClickAccept={() => stackRef.current?.swipeRight()}
					onClickReject={() => stackRef.current?.swipeLeft()}
				/>
			}
		>
			<div className="flex flex-col justify-center items-center h-full flex-1">
				<SwipeCardStack
					ref={stackRef}
					count={noGos.length}
					initialIndex={initialIndex}
					onCommit={getDirectionForIndex}
					onExhausted={nextStep}
					onBefore={prevStep}
					onBack={getDirectionForIndex}
					onIndexChange={handleIndexChange}
					onSwipe={handleSwipe}
					renderCard={(index: number) => (
						<SwipeCard index={index} cards={noGos} minHeight={257} />
					)}
				/>
			</div>
		</StepLayout>
	);
}
