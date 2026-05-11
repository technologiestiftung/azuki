import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { content } from "../../../content/de";
import { useAppStore } from "../../../store/useAppStore";
import { type WorkPreferenceChoice } from "../../../common";
import { StepLayout } from "./StepLayout";
import { useFlowNavigation } from "../../../routing/useFlowNavigation";
import { parseHashCardIndex } from "../../../routing/routes";
import { SelectableCardButton } from "../../primitives/buttons/SelectableCardButton";

const OVERLAY_ILLUSTRATIONS: Partial<
	Record<string, Record<"a" | "b", string>>
> = {
	environment: {
		a: "/illustrations/work-preferences/inside.svg",
		b: "/illustrations/work-preferences/outside.svg",
	},
};

export function WorkPreferencesStep() {
	const { pathname, hash } = useLocation();
	const navigate = useNavigate();
	const setWorkPreference = useAppStore((state) => state.setWorkPreference);
	const workPreferences = useAppStore((state) => state.profile.workPreferences);
	const { goNext } = useFlowNavigation();
	const pairs = content["workPreferences.pairs"];
	const pairIndex = Math.min(
		parseHashCardIndex(hash),
		Math.max(0, pairs.length - 1),
	);
	const current = pairs[pairIndex];

	const baseIllustration = "/illustrations/work-preferences/star.svg";
	const [selectedChoice, setSelectedChoice] =
		useState<WorkPreferenceChoice | null>(null);
	const selectedIllustrationPath = selectedChoice
		? (OVERLAY_ILLUSTRATIONS[current.id]?.[selectedChoice] ?? baseIllustration)
		: baseIllustration;

	const hasAnyExplicitWorkPreference = pairs.some((pair) => {
		const choice = workPreferences[pair.id];
		return choice === "a" || choice === "b";
	});
	const isOnLastPair = pairIndex >= pairs.length - 1;
	const isSkipConfirmDialogOpen = isOnLastPair && !hasAnyExplicitWorkPreference;

	useEffect(() => {
		if (pathname === "/expectations" && !hash) {
			navigate({ pathname: "/expectations", hash: "#0" }, { replace: true });
		}
	}, [pathname, hash, navigate]);

	function handleChoice(choice: WorkPreferenceChoice) {
		setSelectedChoice(choice);
		setWorkPreference(current.id, choice);
	}

	function handleNext() {
		setSelectedChoice(null);
		goNext();
	}

	const skipConfirmOnStay = useCallback(() => {
		navigate({ pathname, hash: "#0" }, { replace: true });
	}, [navigate, pathname]);

	return (
		<StepLayout
			question={content["workPreferences.question"]}
			onNext={handleNext}
			onSkip={handleNext}
			hasSkipButton={true}
			hasNextButton={true}
			skipConfirmTitleKey="skipConfirmDialog.skipAll.title"
			skipConfirmDescriptionKey="skipConfirmDialog.skipAll.description"
			isSkipConfirmDialogOpen={isSkipConfirmDialogOpen}
			skipConfirmOnStay={skipConfirmOnStay}
		>
			<div className="flex flex-1 flex-col gap-3 h-full">
				<div className="relative flex flex-1 h-[217px] items-center justify-center">
					<img src={baseIllustration} alt="" className="object-contain" />
					{selectedIllustrationPath && (
						<img
							key={selectedIllustrationPath}
							src={selectedIllustrationPath}
							alt=""
							className="absolute inset-0 w-full h-full object-contain animate-fadeIn"
						/>
					)}
				</div>
				<div className="flex gap-3 pb-4" key={current.id}>
					<SelectableCardButton
						label={current.a}
						selected={
							selectedChoice === "a" || workPreferences[current.id] === "a"
						}
						onClick={() => handleChoice("a")}
					/>
					<SelectableCardButton
						label={current.b}
						selected={
							selectedChoice === "b" || workPreferences[current.id] === "b"
						}
						onClick={() => handleChoice("b")}
					/>
				</div>
			</div>
		</StepLayout>
	);
}
