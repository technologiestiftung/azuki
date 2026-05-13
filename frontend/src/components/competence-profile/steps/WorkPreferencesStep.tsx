import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { content } from "../../../content/de";
import { useAppStore } from "../../../store/useAppStore";
import { type WorkPreferenceChoice } from "../../../common";
import { StepLayout } from "./StepLayout";
import { useFlowNavigation } from "../../../routing/useFlowNavigation";
import { parseHashCardIndex } from "../../../routing/routes";
import { SelectableCardButton } from "../../primitives/buttons/SelectableCardButton";

const BASE_ILLUSTRATION_Z = 5;
const DEFAULT_OVERLAY_Z = 10;

type OverlayLayer = { src: string; zIndex?: number };

const OVERLAY_ILLUSTRATIONS: Partial<
	Record<string, Record<"a" | "b", OverlayLayer[]>>
> = {
	environment: {
		a: [{ src: "/illustrations/work-preferences/inside.svg" }],
		b: [
			{ src: "/illustrations/work-preferences/sun.svg", zIndex: 1 },
			{ src: "/illustrations/work-preferences/outside.svg" },
		],
	},
	location: {
		a: [{ src: "/illustrations/work-preferences/fixed.svg" }],
		b: [
			{ src: "/illustrations/work-preferences/fixed.svg" },
			{ src: "/illustrations/work-preferences/mobile.svg" },
		],
	},
	"hands-vs-mind": {
		a: [{ src: "/illustrations/work-preferences/practical.svg" }],
		b: [{ src: "/illustrations/work-preferences/mind.svg" }],
	},
	variety: {
		a: [{ src: "/illustrations/work-preferences/routine.svg" }],
		b: [{ src: "/illustrations/work-preferences/variety.svg" }],
	},
	pace: {
		a: [{ src: "/illustrations/work-preferences/fast.svg", zIndex: 1 }],
		b: [{ src: "/illustrations/work-preferences/slow.svg", zIndex: 1 }],
	},
	structure: {
		a: [{ src: "/illustrations/work-preferences/task.svg" }],
		b: [{ src: "/illustrations/work-preferences/idea.svg" }],
	},
	people: {
		a: [{ src: "/illustrations/work-preferences/alone.svg" }],
		b: [{ src: "/illustrations/work-preferences/contact.svg" }],
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

	const baseIllustration =
		current.id === "pace"
			? "/illustrations/work-preferences/clock.svg"
			: "/illustrations/work-preferences/star.svg";

	const [selectedChoice, setSelectedChoice] =
		useState<WorkPreferenceChoice | null>(null);

	const activeChoice = selectedChoice ?? workPreferences[current.id] ?? null;

	const selectedOverlayLayers: OverlayLayer[] =
		activeChoice && (activeChoice === "a" || activeChoice === "b")
			? (OVERLAY_ILLUSTRATIONS[current.id]?.[activeChoice] ?? [])
			: [];

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
						className="relative object-contain h-full"
						style={{ zIndex: BASE_ILLUSTRATION_Z }}
					/>
					{selectedOverlayLayers.map(({ src, zIndex }) => (
						<img
							key={src}
							src={src}
							alt=""
							className="absolute inset-0 w-full h-full object-contain animate-fadeInUp"
							style={{ zIndex: zIndex ?? DEFAULT_OVERLAY_Z }}
						/>
					))}
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
