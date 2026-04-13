import { useCallback, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { content } from "../../../../content/de";
import { useAppStore } from "../../../../store/useAppStore";
import { StepLayout } from "../StepLayout";
import { useFlowNavigation } from "../../../../routing/useFlowNavigation";
import { StrengthsSlider } from "./StrengthsSlider";
import { strengths } from "./strengths";
import { SwipeCardStack } from "../../../primitives/swipe-card-stack/SwipeCardStack";
import type {
	SwipeCardStackHandle,
	SwipeDirection,
} from "../../../primitives/swipe-card-stack/SwipeCardStack";
import { SwipeCard } from "../../../primitives/swipe-card-stack/SwipeCard";
import { parseHashCardIndex } from "../../../../routing/routes";

export function StrengthsStep() {
	const { pathname, hash } = useLocation();
	const navigate = useNavigate();
	const { goNext, goPrevious } = useFlowNavigation();

	const strengthValues = useAppStore((state) => state.profile.strengths);
	const setStrength = useAppStore((state) => state.setStrength);

	const stackRef = useRef<SwipeCardStackHandle>(null);
	const cardIndex = Math.min(
		parseHashCardIndex(hash),
		Math.max(0, strengths.length - 1),
	);

	useEffect(() => {
		if (pathname === "/strengths" && !hash) {
			navigate({ pathname: "/strengths", hash: "#0" }, { replace: true });
		}
	}, [pathname, hash, navigate]);

	const getDirectionForIndex = useCallback(
		(index: number): SwipeDirection => {
			const card = strengths[index];
			const value = strengthValues[card?.id] ?? 0.5;

			if (value === 0.5) {
				return "up";
			}

			return value > 0.5 ? "right" : "left";
		},
		[strengthValues],
	);

	const handleIndexChange = useCallback(
		(index: number) => {
			navigate(
				{ pathname: "/strengths", hash: `#${index}` },
				{ replace: true },
			);
		},
		[navigate],
	);

	const currentCard = strengths[cardIndex];
	const currentValue = strengthValues[currentCard?.id] ?? 0.5;

	const hasAnyExplicitStrengthRating = strengths.some(
		(strength) => strength.id in strengthValues,
	);
	const isOnLastStrengthCard = cardIndex >= strengths.length - 1;

	const isSkipConfirmDialogOpen =
		isOnLastStrengthCard && !hasAnyExplicitStrengthRating;

	const handleSliderChange = useCallback(
		(value: number) => {
			if (currentCard) {
				setStrength(currentCard.id, value);
			}
		},
		[currentCard, setStrength],
	);

	const handleSkip = useCallback(() => {
		stackRef.current?.goNext();
	}, []);

	const skipConfirmOnStay = useCallback(() => {
		navigate({ pathname, hash: "#0" }, { replace: true });
	}, [navigate, pathname]);

	return (
		<StepLayout
			question={content["strengths.question"]}
			onNext={() => stackRef.current?.goNext()}
			onSkip={handleSkip}
			onBack={() => stackRef.current?.goBack()}
			hasSkipButton={true}
			skipLabel={content["strengths.skipButton.label"]}
			isSkipConfirmDialogOpen={isSkipConfirmDialogOpen}
			skipConfirmTitleKey="skipConfirmDialog.skipAll.title"
			skipConfirmDescriptionKey="skipConfirmDialog.skipAll.description"
			skipConfirmOnStay={skipConfirmOnStay}
		>
			<div className="flex flex-col justify-center items-center h-[85%] flex-1 gap-y-5 py-5">
				<SwipeCardStack
					ref={stackRef}
					count={strengths.length}
					initialIndex={cardIndex}
					onCommit={getDirectionForIndex}
					onExhausted={goNext}
					onBefore={goPrevious}
					onBack={getDirectionForIndex}
					onIndexChange={handleIndexChange}
					renderCard={(index: number) => (
						<SwipeCard index={index} cards={strengths} minHeight={202} />
					)}
					isDraggingEnabled={false}
				/>
				<StrengthsSlider
					value={currentValue}
					onChange={handleSliderChange}
					minLabel={content["strengths.sliderMin"]}
					maxLabel={content["strengths.sliderMax"]}
				/>
			</div>
		</StepLayout>
	);
}
