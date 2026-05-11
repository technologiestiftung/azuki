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
	location: {
		a: "/illustrations/work-preferences/fixed.svg",
		b: "/illustrations/work-preferences/mobile.svg",
	},
	"hands-vs-mind": {
		a: "/illustrations/work-preferences/practical.svg",
		b: "/illustrations/work-preferences/mind.svg",
	},
	variety: {
		a: "/illustrations/work-preferences/routine.svg",
		b: "/illustrations/work-preferences/variety.svg",
	},
	pace: {
		a: "/illustrations/work-preferences/fast.svg",
		b: "/illustrations/work-preferences/slow.svg",
	},
} as const;

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
	const activeChoice = selectedChoice ?? workPreferences[current.id] ?? null;
	const selectedIllustrationPath =
		activeChoice && (activeChoice === "a" || activeChoice === "b")
			? (OVERLAY_ILLUSTRATIONS[current.id]?.[activeChoice] ?? baseIllustration)
			: baseIllustration;

	const hasAnyExplicitWorkPreference = pairs.some((pair) => {
		const choice = workPreferences[pair.id];
		return choice === "a" || choice === "b";
	});
	const isOnLastPair = pairIndex >= pairs.length - 1;
	const isSkipConfirmDialogOpen = isOnLastPair && !hasAnyExplicitWorkPreference;

	useEffect(() => {
		if (pathname === "/preferences" && !hash) {
			navigate({ pathname: "/preferences", hash: "#0" }, { replace: true });
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

	function handleSkip() {
		setSelectedChoice(null);
		setWorkPreference(current.id, null);
		goNext();
	}

	const skipConfirmOnStay = useCallback(() => {
		navigate({ pathname, hash: "#0" }, { replace: true });
	}, [navigate, pathname]);

	return (
		<StepLayout
			question={content["workPreferences.question"]}
			onNext={handleNext}
			onSkip={handleSkip}
			hasSkipButton={true}
			hasNextButton={true}
			skipConfirmTitleKey="skipConfirmDialog.skipAll.title"
			skipConfirmDescriptionKey="skipConfirmDialog.skipAll.description"
			isSkipConfirmDialogOpen={isSkipConfirmDialogOpen}
			skipConfirmOnStay={skipConfirmOnStay}
		>
			<div className="flex flex-1 flex-col gap-3 h-full">
				<div className="relative flex flex-1 h-[217px] items-center justify-center">
					<img
						src={baseIllustration}
						alt=""
						className="object-contain h-full"
					/>
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
						selected={workPreferences[current.id] === "a"}
						onClick={() => handleChoice("a")}
					/>
					<SelectableCardButton
						label={current.b}
						selected={workPreferences[current.id] === "b"}
						onClick={() => handleChoice("b")}
					/>
				</div>
			</div>
		</StepLayout>
	);
}
