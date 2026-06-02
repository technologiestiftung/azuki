import { useCallback, useRef, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { content } from "../../../../content";
import { useAppStore } from "../../../../store/useAppStore";
import { StepLayout } from "../StepLayout";
import { useFlowNavigation } from "../../../../routing/useFlowNavigation";
import { StrengthsSlider } from "./StrengthsSlider";
import { strengths, STRENGTH_STEP_CARD_COUNT } from "./strengths";
import { InputBottomSheet } from "../../../input-bottom-sheet/InputBottomSheet";
import { CustomSwipeStepCard } from "../../CustomSwipeStepCard";
import { SwipeCardStack } from "../../../primitives/swipe-card-stack/SwipeCardStack";
import type {
	SwipeCardStackHandle,
	SwipeDirection,
} from "../../../primitives/swipe-card-stack/SwipeCardStack";
import { SwipeCard } from "../../../primitives/swipe-card-stack/SwipeCard";
import { parseHashCardIndex } from "../../../../routing/routes";

export const STACK_GHOST_LAYER_SCALE = 84 / 100;

export function StrengthsStep() {
	const { pathname, hash } = useLocation();
	const navigate = useNavigate();
	const { goNext, goPrevious } = useFlowNavigation();

	const profile = useAppStore((state) => state.profile);
	const strengthValues = profile.strengths;
	const setStrength = useAppStore((state) => state.setStrength);
	const addCustomStrength = useAppStore((state) => state.addCustomStrength);
	const toggleCustomStrength = useAppStore(
		(state) => state.toggleCustomStrength,
	);
	const [inputSheetOpen, setInputSheetOpen] = useState(false);
	const [sliderExiting, setSliderExiting] = useState(false);
	const customStrengthsSectionRef = useRef<HTMLDivElement>(null);

	const handleAddCustomStrength = (value: string) => {
		const trimmedValue = value.trim();
		if (trimmedValue && !profile.customStrengths.includes(trimmedValue)) {
			addCustomStrength(trimmedValue);
		}
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				customStrengthsSectionRef.current?.scrollIntoView({
					behavior: "smooth",
					block: "start",
				});
			});
		});
	};

	const stackRef = useRef<SwipeCardStackHandle>(null);
	const customStrengthCardIndex = strengths.length;
	const cardIndex = Math.min(
		parseHashCardIndex(hash),
		STRENGTH_STEP_CARD_COUNT - 1,
	);
	const isCustomStrengthCard = cardIndex === customStrengthCardIndex;

	useEffect(() => {
		if (pathname === "/strengths" && !hash) {
			navigate({ pathname: "/strengths", hash: "#0" }, { replace: true });
		}
	}, [pathname, hash, navigate]);

	useEffect(() => {
		if (!isCustomStrengthCard) {
			setSliderExiting(false);
		}
	}, [isCustomStrengthCard]);

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
	const isOnLastPredefinedCard = cardIndex === customStrengthCardIndex - 1;

	const isSkipConfirmDialogOpen =
		isOnLastPredefinedCard && !hasAnyExplicitStrengthRating;

	const goToCustomStrengthCard = useCallback(() => {
		navigate(
			{ pathname: "/strengths", hash: `#${customStrengthCardIndex}` },
			{ replace: true },
		);
		setSliderExiting(false);
	}, [navigate, customStrengthCardIndex]);

	const leaveLastPredefinedCard = useCallback(() => {
		setSliderExiting(true);
		stackRef.current?.goNext();
	}, []);

	const handleSliderChange = useCallback(
		(value: number) => {
			if (currentCard) {
				setStrength(currentCard.id, value);
			}
		},
		[currentCard, setStrength],
	);

	const handleSkip = useCallback(() => {
		if (isCustomStrengthCard) {
			goNext();
			return;
		}
		if (isOnLastPredefinedCard) {
			leaveLastPredefinedCard();
			return;
		}
		stackRef.current?.goNext();
	}, [
		isCustomStrengthCard,
		isOnLastPredefinedCard,
		leaveLastPredefinedCard,
		goNext,
	]);

	const handleNext = useCallback(() => {
		if (isCustomStrengthCard) {
			goNext();
			return;
		}
		if (isOnLastPredefinedCard) {
			leaveLastPredefinedCard();
			return;
		}
		stackRef.current?.goNext();
	}, [
		isCustomStrengthCard,
		isOnLastPredefinedCard,
		leaveLastPredefinedCard,
		goNext,
	]);

	const handleBack = useCallback(() => {
		if (isCustomStrengthCard) {
			navigate(
				{ pathname: "/strengths", hash: `#${customStrengthCardIndex - 1}` },
				{ replace: true },
			);
			return;
		}
		stackRef.current?.goBack();
	}, [isCustomStrengthCard, navigate, customStrengthCardIndex]);

	const skipConfirmOnStay = useCallback(() => {
		navigate({ pathname, hash: "#0" }, { replace: true });
	}, [navigate, pathname]);

	return (
		<StepLayout
			question={content["strengths.question"]}
			onNext={handleNext}
			onSkip={handleSkip}
			onBack={handleBack}
			hasSkipButton={true}
			skipLabel={content["strengths.skipButton.label"]}
			isSkipConfirmDialogOpen={isSkipConfirmDialogOpen}
			skipConfirmTitleKey="skipConfirmDialog.skipAll.title"
			skipConfirmDescriptionKey="skipConfirmDialog.skipAll.description"
			skipConfirmOnStay={skipConfirmOnStay}
		>
			<div
				className={`flex min-h-0 flex-1 flex-col items-center h-full pb-5 ${
					isCustomStrengthCard ? "min-w-0" : "gap-5 justify-center"
				}`}
			>
				{!isCustomStrengthCard && (
					<>
						<SwipeCardStack
							ref={stackRef}
							count={strengths.length}
							initialIndex={Math.min(cardIndex, customStrengthCardIndex - 1)}
							stackGhostLayerScale={STACK_GHOST_LAYER_SCALE}
							onCommit={getDirectionForIndex}
							onExhausted={goToCustomStrengthCard}
							onBefore={goPrevious}
							onBack={getDirectionForIndex}
							onIndexChange={handleIndexChange}
							renderCard={({ index }) => (
								<SwipeCard index={index} cards={strengths} />
							)}
							isDraggingEnabled={false}
						/>
						<div
							className={`w-full shrink-0 overflow-hidden ${
								sliderExiting ? "animate-strengthsSliderSlideOut" : ""
							}`}
						>
							<StrengthsSlider
								value={currentValue}
								onChange={handleSliderChange}
								minLabel={content["strengths.sliderMin"]}
								maxLabel={content["strengths.sliderMax"]}
							/>
						</div>
					</>
				)}
				{isCustomStrengthCard && (
					<CustomSwipeStepCard
						key="custom-strength-card"
						sectionRef={customStrengthsSectionRef}
						stackGhostLayerScale={STACK_GHOST_LAYER_SCALE}
						items={profile.customStrengths}
						isSelected={(item) =>
							profile.selectedCustomStrengths.includes(item)
						}
						onToggle={toggleCustomStrength}
						onAddClick={() => setInputSheetOpen(true)}
						illustrationSrc="/illustrations/custom-strength.svg"
						labels={{
							listLabel: content["strengths.customStrength.label"],
							pillAriaPostfix:
								content["strengths.customStrength.pill.label.postfix"],
							addMore: content["strengths.addCustomStrengthButton.addMore"],
							addLabel: content["strengths.addCustomStrengthButton.label"],
							addAriaLabel:
								content["strengths.addCustomStrengthButton.ariaLabel"],
							customTitle: content["strengths.customStrength.title"],
							customDescription:
								content["strengths.customStrength.description"],
						}}
					/>
				)}
			</div>
			<InputBottomSheet
				open={inputSheetOpen}
				onClose={() => setInputSheetOpen(false)}
				sheetAriaLabel={content["strengths.bottomSheet.input.addPlaceholder"]}
				inputPlaceholder={content["strengths.bottomSheet.input.addPlaceholder"]}
				errorMessage={content["strengths.bottomSheet.errorMessage"]}
				onSubmit={handleAddCustomStrength}
			/>
		</StepLayout>
	);
}
