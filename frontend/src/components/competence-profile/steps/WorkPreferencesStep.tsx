import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { content } from "../../../content";
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

	const activeChoice = workPreferences[current.id] ?? null;

	const selectedOverlayLayers: OverlayLayer[] =
		activeChoice && (activeChoice === "a" || activeChoice === "b")
			? (OVERLAY_ILLUSTRATIONS[current.id]?.[activeChoice] ?? [])
			: [];

	useEffect(() => {
		if (pathname === "/preferences" && !hash) {
			navigate({ pathname: "/preferences", hash: "#0" }, { replace: true });
		}
	}, [pathname, hash, navigate]);

	function handleChoice(choice: WorkPreferenceChoice) {
		setWorkPreference(current.id, choice);
	}

	function handleNext() {
		goNext();
	}

	function handleSkip() {
		setWorkPreference(current.id, null);
		goNext();
	}

	return (
		<StepLayout
			question={content["workPreferences.question"]}
			onNext={handleNext}
			onSkip={handleSkip}
			hasSkipButton={true}
			hasNextButton={true}
		>
			<div className="flex flex-1 flex-col justify-between gap-3">
				<div className="relative flex h-[217px] shrink-0 items-center justify-center">
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
				<div className="flex shrink-0 gap-3 pb-4" key={current.id}>
					<SelectableCardButton
						label={current.a}
						selected={workPreferences[current.id] === "a"}
						onClick={() => handleChoice("a")}
						className="items-center text-center"
					/>
					<SelectableCardButton
						label={current.b}
						selected={workPreferences[current.id] === "b"}
						onClick={() => handleChoice("b")}
						className="items-center text-center"
					/>
				</div>
			</div>
		</StepLayout>
	);
}
