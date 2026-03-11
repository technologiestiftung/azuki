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

export function NoGosStep() {
	const stackRef = useRef<SwipeCardStackHandle>(null);
	const initialIndex = useAppStore.getState().noGoSubIndex;
	const setNoGo = useAppStore((state) => state.setNoGo);
	const nextStep = useAppStore((state) => state.nextStep);
	const prevStep = useAppStore((state) => state.prevStep);
	const profile = useAppStore((state) => state.profile);
	const setNoGoSubIndex = useAppStore((state) => state.setNoGoSubIndex);

	const getDirectionForIndex = useCallback(
		(index: number): SwipeDirection => {
			const card = noGos[index];
			const value: NoGoAnswer = profile.noGos[card?.id] ?? "accepted";
			return value === "accepted" ? "right" : "left";
		},
		[profile.noGos],
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

	const actionButtons = () => {
		return (
			<div className="flex gap-3">
				<button
					className="py-2 px-5 min-h-14 rounded-2xl text-lg leading-6 font-medium text-orange-1000 flex items-center justify-center gap-2 flex-1 bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
					onClick={() => stackRef.current?.swipeLeft()}
					aria-label={content["noGos.ariaLabel.reject"]}
				>
					{content["noGos.rejectLabel"]}
					<img src="/icons/close-black.svg" alt="" className="w-6 h-6" />
				</button>
				<button
					className="py-2 px-5 min-h-14 rounded-2xl text-lg leading-6 font-medium text-orange-1000 flex items-center justify-center gap-2 flex-1 bg-sky-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
					onClick={() => stackRef.current?.swipeRight()}
					aria-label={content["noGos.ariaLabel.accept"]}
				>
					{content["noGos.acceptLabel"]}
					<img src="/icons/check-black.svg" alt="" className="w-6 h-6" />
				</button>
			</div>
		);
	};

	return (
		<StepLayout
			question={content["noGos.question"]}
			currentStep={Step.NoGos}
			onNext={() => stackRef.current?.goNext()}
			onSkip={() => stackRef.current?.goNext()}
			onBack={() => stackRef.current?.goBack()}
			nextDisabled={false}
			hasSkipButton={false}
			hasNextButton={false}
			bottomContent={actionButtons()}
		>
			<div className="flex flex-col justify-center items-center h-full flex-1">
				<SwipeCardStack
					ref={stackRef}
					count={noGos.length}
					initialIndex={initialIndex}
					onCommit={getDirectionForIndex}
					onAdvance={handleIndexChange}
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
