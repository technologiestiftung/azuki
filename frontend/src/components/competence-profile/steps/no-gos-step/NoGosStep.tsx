import { useRef, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { content } from "../../../../content/de";
import { useAppStore } from "../../../../store/useAppStore";
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
import { useFlowNavigation } from "../../../../routing/useFlowNavigation";
import { parseHashCardIndex } from "../../../../routing/routes";

export function NoGosStep() {
	const { pathname, hash } = useLocation();
	const navigate = useNavigate();
	const { goNext, goPrevious } = useFlowNavigation();

	const stackRef = useRef<SwipeCardStackHandle>(null);
	const cardIndex = Math.min(
		parseHashCardIndex(hash),
		Math.max(0, noGos.length - 1),
	);

	useEffect(() => {
		if (pathname === "/nogos" && !hash) {
			navigate({ pathname: "/nogos", hash: "#0" }, { replace: true });
		}
	}, [pathname, hash, navigate]);

	const setNoGo = useAppStore(
		(state) => state.setNoGo as (id: string, answer: NoGoAnswer | null) => void,
	);

	const noGosValues = useAppStore((state) => state.profile.noGos);

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

	const handleSkip = useCallback(() => {
		stackRef.current?.swipeUp();
	}, []);

	const hasAnyExplicitNoGoAnswer = noGos.some((card) => {
		const value = noGosValues[card.id];
		return value === "accepted" || value === "rejected";
	});
	const isOnLastNoGoCard = cardIndex >= noGos.length - 1;
	const isSkipConfirmDialogOpen = isOnLastNoGoCard && !hasAnyExplicitNoGoAnswer;

	const skipConfirmOnStay = useCallback(() => {
		navigate({ pathname, hash: "#0" }, { replace: true });
	}, [navigate, pathname]);

	return (
		<StepLayout
			question={content["noGos.question"]}
			onNext={() => stackRef.current?.goNext()}
			onSkip={handleSkip}
			onBack={() => stackRef.current?.goBack()}
			hasSkipButton={true}
			hasNextButton={false}
			skipLabel={content["noGos.skipButton.label"]}
			isSkipConfirmDialogOpen={isSkipConfirmDialogOpen}
			skipConfirmTitleKey="skipConfirmDialog.skipAll.title"
			skipConfirmDescriptionKey="skipConfirmDialog.skipAll.description"
			skipConfirmOnStay={skipConfirmOnStay}
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
					initialIndex={cardIndex}
					isSwipeUpGestureEnabled={false}
					onCommit={getDirectionForIndex}
					onExhausted={goNext}
					onBefore={goPrevious}
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
