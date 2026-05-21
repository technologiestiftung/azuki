import { useRef, useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { content } from "../../../../content";
import { useAppStore } from "../../../../store/useAppStore";
import type { NoGoAnswer } from "@azuki/shared";
import { StepLayout } from "../StepLayout";
import { noGos, NO_GO_STEP_CARD_COUNT } from "./no-gos";
import { SwipeCardStack } from "../../../primitives/swipe-card-stack/SwipeCardStack";
import type {
	SwipeCardStackHandle,
	SwipeDirection,
} from "../../../primitives/swipe-card-stack/SwipeCardStack";
import { SwipeCard } from "../../../primitives/swipe-card-stack/SwipeCard";
import { NoGoActionButtons } from "./NoGoActionButtons";
import { useFlowNavigation } from "../../../../routing/useFlowNavigation";
import { parseHashCardIndex } from "../../../../routing/routes";
import type { TopCardHorizontalAccentBg } from "../../../primitives/swipe-card-stack/swipe-card-utils";
import { InputBottomSheet } from "../../../input-bottom-sheet/InputBottomSheet";
import { CustomSwipeStepCard } from "../../CustomSwipeStepCard";

export const STACK_GHOST_LAYER_SCALE = 86 / 100;

const NO_GO_CARD_SWIPE_TINT: TopCardHorizontalAccentBg = {
	left: "bg-orange-500",
	right: "bg-sky-300",
};

export function NoGosStep() {
	const { pathname, hash } = useLocation();
	const navigate = useNavigate();
	const { goNext, goPrevious } = useFlowNavigation();

	const profile = useAppStore((state) => state.profile);
	const stackRef = useRef<SwipeCardStackHandle>(null);
	const customNoGoCardIndex = noGos.length;
	const cardIndex = Math.min(
		parseHashCardIndex(hash),
		NO_GO_STEP_CARD_COUNT - 1,
	);
	const isCustomNoGoCard = cardIndex === customNoGoCardIndex;

	const [inputSheetOpen, setInputSheetOpen] = useState(false);
	const [actionsExiting, setActionsExiting] = useState(false);
	const customNoGosSectionRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (pathname === "/nogos" && !hash) {
			navigate({ pathname: "/nogos", hash: "#0" }, { replace: true });
		}
	}, [pathname, hash, navigate]);

	useEffect(() => {
		if (!isCustomNoGoCard) {
			setActionsExiting(false);
		}
	}, [isCustomNoGoCard]);

	const setNoGo = useAppStore(
		(state) => state.setNoGo as (id: string, answer: NoGoAnswer | null) => void,
	);
	const addCustomNoGo = useAppStore((state) => state.addCustomNoGo);
	const toggleCustomNoGo = useAppStore((state) => state.toggleCustomNoGo);

	const noGosValues = profile.noGos;

	const handleAddCustomNoGo = (value: string) => {
		const trimmedValue = value.trim();
		if (trimmedValue && !profile.customNoGos.includes(trimmedValue)) {
			addCustomNoGo(trimmedValue);
		}
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				customNoGosSectionRef.current?.scrollIntoView({
					behavior: "smooth",
					block: "start",
				});
			});
		});
	};

	const getDirectionForIndex = useCallback(
		(index: number): SwipeDirection => {
			const card = noGos[index];
			if (!card) {
				return "right";
			}
			const value = noGosValues[card.id];
			if (value === null) {
				return "up";
			}
			const resolved: NoGoAnswer = value ?? "accepted";
			return resolved === "accepted" ? "right" : "left";
		},
		[noGosValues],
	);

	const handleIndexChange = useCallback(
		(index: number) => {
			navigate({ pathname: "/nogos", hash: `#${index}` }, { replace: true });
		},
		[navigate],
	);

	const handleSwipe = useCallback(
		(direction: SwipeDirection, index: number) => {
			const card = noGos[index];
			if (!card) {
				return;
			}
			if (direction === "up") {
				setNoGo(card.id, null);
				return;
			}
			const answer: NoGoAnswer =
				direction === "right" ? "accepted" : "rejected";
			setNoGo(card.id, answer);
		},
		[setNoGo],
	);

	const goToCustomNoGoCard = useCallback(() => {
		navigate(
			{ pathname: "/nogos", hash: `#${customNoGoCardIndex}` },
			{ replace: true },
		);
		setActionsExiting(false);
	}, [navigate, customNoGoCardIndex]);

	const leaveLastPredefinedCard = useCallback(() => {
		setActionsExiting(true);
		stackRef.current?.goNext();
	}, []);

	const handleSkip = useCallback(() => {
		if (isCustomNoGoCard) {
			goNext();
			return;
		}
		if (cardIndex === customNoGoCardIndex - 1) {
			leaveLastPredefinedCard();
			return;
		}
		stackRef.current?.swipeUp();
	}, [
		isCustomNoGoCard,
		cardIndex,
		customNoGoCardIndex,
		leaveLastPredefinedCard,
		goNext,
	]);

	const handleNext = useCallback(() => {
		if (isCustomNoGoCard) {
			goNext();
			return;
		}
		if (cardIndex === customNoGoCardIndex - 1) {
			leaveLastPredefinedCard();
			return;
		}
		stackRef.current?.goNext();
	}, [
		isCustomNoGoCard,
		cardIndex,
		customNoGoCardIndex,
		leaveLastPredefinedCard,
		goNext,
	]);

	const handleBack = useCallback(() => {
		if (isCustomNoGoCard) {
			navigate(
				{ pathname: "/nogos", hash: `#${customNoGoCardIndex - 1}` },
				{ replace: true },
			);
			return;
		}
		stackRef.current?.goBack();
	}, [isCustomNoGoCard, navigate, customNoGoCardIndex]);

	const hasAnyExplicitNoGoAnswer = noGos.some((card) => {
		const value = noGosValues[card.id];
		return value === "accepted" || value === "rejected";
	});
	const isOnLastPredefinedCard = cardIndex === customNoGoCardIndex - 1;
	const isSkipConfirmDialogOpen =
		isOnLastPredefinedCard && !hasAnyExplicitNoGoAnswer;

	const skipConfirmOnStay = useCallback(() => {
		navigate({ pathname, hash: "#0" }, { replace: true });
	}, [navigate, pathname]);

	return (
		<StepLayout
			question={content["noGos.question"]}
			onNext={handleNext}
			onSkip={handleSkip}
			onBack={handleBack}
			hasSkipButton={true}
			hasNextButton={isCustomNoGoCard}
			skipLabel={content["noGos.skipButton.label"]}
			isSkipConfirmDialogOpen={isSkipConfirmDialogOpen}
			skipConfirmTitleKey="skipConfirmDialog.skipAll.title"
			skipConfirmDescriptionKey="skipConfirmDialog.skipAll.description"
			skipConfirmOnStay={skipConfirmOnStay}
			bottomContent={
				!isCustomNoGoCard ? (
					<div
						className={
							actionsExiting ? "animate-strengthsSliderSlideOut" : undefined
						}
					>
						<NoGoActionButtons
							onClickAccept={() => stackRef.current?.swipeRight()}
							onClickReject={() => stackRef.current?.swipeLeft()}
						/>
					</div>
				) : undefined
			}
		>
			<div
				className={`flex min-h-0 flex-1 flex-col h-full pb-5 ${
					isCustomNoGoCard ? "min-w-0" : ""
				}`}
			>
				{!isCustomNoGoCard && (
					<SwipeCardStack
						ref={stackRef}
						count={noGos.length}
						initialIndex={Math.min(cardIndex, customNoGoCardIndex - 1)}
						isSwipeUpGestureEnabled={false}
						stackGhostLayerScale={STACK_GHOST_LAYER_SCALE}
						horizontalAccentBg={NO_GO_CARD_SWIPE_TINT}
						onCommit={getDirectionForIndex}
						onExhausted={goToCustomNoGoCard}
						onBefore={goPrevious}
						onBack={getDirectionForIndex}
						onIndexChange={handleIndexChange}
						onSwipe={handleSwipe}
						renderCard={({
							index,
							dragDirection,
							dragProgress,
							slideInHorizontalColorFade = false,
						}) => (
							<SwipeCard
								index={index}
								cards={noGos}
								dragDirection={dragDirection}
								dragProgress={dragProgress}
								dragColorWash={NO_GO_CARD_SWIPE_TINT}
								slideInHorizontalColorFade={slideInHorizontalColorFade}
							/>
						)}
					/>
				)}
				{isCustomNoGoCard && (
					<CustomSwipeStepCard
						key="custom-nogo-card"
						sectionRef={customNoGosSectionRef}
						stackGhostLayerScale={STACK_GHOST_LAYER_SCALE}
						items={profile.customNoGos}
						isSelected={(item) => profile.noGos[item] === "rejected"}
						onToggle={toggleCustomNoGo}
						onAddClick={() => setInputSheetOpen(true)}
						illustrationSrc="/illustrations/custom-strength.svg"
						labels={{
							listLabel: content["noGos.customNoGo.label"],
							pillAriaPostfix: content["noGos.customNoGo.pill.label.postfix"],
							addMore: content["noGos.addCustomNoGoButton.addMore"],
							addLabel: content["noGos.addCustomNoGoButton.label"],
							addAriaLabel: content["noGos.addCustomNoGoButton.ariaLabel"],
							customTitle: content["noGos.customNoGo.title"],
							customDescription: content["noGos.customNoGo.description"],
						}}
					/>
				)}
			</div>
			<InputBottomSheet
				open={inputSheetOpen}
				onClose={() => setInputSheetOpen(false)}
				sheetAriaLabel={content["noGos.bottomSheet.input.addPlaceholder"]}
				inputPlaceholder={content["noGos.bottomSheet.input.addPlaceholder"]}
				onSubmit={handleAddCustomNoGo}
			/>
		</StepLayout>
	);
}
