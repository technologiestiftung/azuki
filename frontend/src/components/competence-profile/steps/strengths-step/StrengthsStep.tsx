import {
	useCallback,
	useRef,
	useEffect,
	useState,
	type CSSProperties,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { content } from "../../../../content";
import { useAppStore } from "../../../../store/useAppStore";
import { StepLayout } from "../StepLayout";
import { useFlowNavigation } from "../../../../routing/useFlowNavigation";
import { StrengthsSlider } from "./StrengthsSlider";
import { strengths, STRENGTH_STEP_CARD_COUNT } from "./strengths";
import { PrimaryThemedButton } from "../../../primitives/buttons/PrimaryThemedButton";
import { InputBottomSheet } from "../../../input-bottom-sheet/InputBottomSheet";
import { SwipeCardStack } from "../../../primitives/swipe-card-stack/SwipeCardStack";
import type {
	SwipeCardStackHandle,
	SwipeDirection,
} from "../../../primitives/swipe-card-stack/SwipeCardStack";
import { SwipeCard } from "../../../primitives/swipe-card-stack/SwipeCard";
import { parseHashCardIndex } from "../../../../routing/routes";
import { Pill } from "../../../primitives/buttons/Pill";

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
					<div
						key="custom-strength-card"
						ref={customStrengthsSectionRef}
						className="flex h-full min-h-0 w-full flex-1 flex-col origin-top animate-customStrengthCardExpand"
						style={
							{
								"--stack-ghost-scale": String(STACK_GHOST_LAYER_SCALE),
							} as CSSProperties
						}
					>
						<div className="flex h-full min-h-0 w-full flex-1 flex-col rounded-3xl bg-gray-200 py-5 px-6  mb-3">
							{profile.customStrengths.length > 0 ? (
								<>
									<h3 className="text-lg font-semibold text-gray-500 mb-2 shrink-0">
										{content["strengths.customStrength.label"]}
									</h3>
									<ul className="flex flex-col gap-2 min-h-0 flex-1 overflow-y-auto">
										{profile.customStrengths.map((customStrength) => (
											<Pill
												key={customStrength}
												label={customStrength}
												selected={profile.selectedCustomStrengths.includes(
													customStrength,
												)}
												onClick={() => toggleCustomStrength(customStrength)}
												ariaLabel={`${customStrength} ${content["strengths.customStrength.pill.label.postfix"]}`}
												className="text-left w-fit"
											/>
										))}
									</ul>
									<PrimaryThemedButton
										className="mt-9 shrink-0"
										onClick={() => setInputSheetOpen(true)}
									>
										<div className="flex items-center gap-2 justify-center">
											<img
												src="/icons/plus-black.svg"
												alt=""
												className="w-6 h-6"
											/>
											{content["strengths.addCustomStrengthButton.addMore"]}
										</div>
									</PrimaryThemedButton>
								</>
							) : (
								<div className="flex h-full min-h-0 flex-1 flex-col gap-2 items-center justify-center">
									<div className="flex min-h-0 w-full flex-1 items-center justify-center p-2">
										<img
											src="/illustrations/custom-strength.svg"
											alt=""
											className="max-h-full w-full max-w-full object-contain"
											draggable={false}
										/>
									</div>
									<div className="flex flex-col gap-0.5 items-center justify-center text-center mb-2 shrink-0">
										<h3 className="text-2xl font-semibold text-gray-700">
											{content["strengths.customStrength.title"]}
										</h3>
										<p className="text-base text-gray-700">
											{content["strengths.customStrength.description"]}
										</p>
									</div>
									<PrimaryThemedButton
										className="text-lg shrink-0"
										ariaLabel={
											content["strengths.addCustomStrengthButton.ariaLabel"]
										}
										onClick={() => setInputSheetOpen(true)}
									>
										<div className="flex items-center gap-2 justify-center">
											<img
												src="/icons/plus-black.svg"
												alt=""
												className="w-6 h-6"
											/>
											{content["strengths.addCustomStrengthButton.label"]}
										</div>
									</PrimaryThemedButton>
								</div>
							)}
						</div>
					</div>
				)}
			</div>
			<InputBottomSheet
				open={inputSheetOpen}
				onClose={() => setInputSheetOpen(false)}
				sheetAriaLabel={content["strengths.bottomSheet.input.addPlaceholder"]}
				inputPlaceholder={content["strengths.bottomSheet.input.addPlaceholder"]}
				onSubmit={handleAddCustomStrength}
			/>
		</StepLayout>
	);
}
