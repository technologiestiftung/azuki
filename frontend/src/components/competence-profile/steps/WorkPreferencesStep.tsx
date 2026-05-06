import { useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { content } from "../../../content";
import { useAppStore } from "../../../store/useAppStore";
import { type WorkPreferenceChoice } from "../../../common";
import { StepLayout } from "./StepLayout";
import { useFlowNavigation } from "../../../routing/useFlowNavigation";
import { parseHashCardIndex } from "../../../routing/routes";

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
		setWorkPreference(current.id, choice);
		goNext();
	}

	function handleSkip() {
		goNext();
	}

	const skipConfirmOnStay = useCallback(() => {
		navigate({ pathname, hash: "#0" }, { replace: true });
	}, [navigate, pathname]);

	return (
		<StepLayout
			question={content["workPreferences.question"]}
			onNext={goNext}
			onSkip={handleSkip}
			hasSkipButton={true}
			hasNextButton={false}
			skipConfirmTitleKey="skipConfirmDialog.skipAll.title"
			skipConfirmDescriptionKey="skipConfirmDialog.skipAll.description"
			isSkipConfirmDialogOpen={isSkipConfirmDialogOpen}
			skipConfirmOnStay={skipConfirmOnStay}
		>
			<div className="flex flex-col justify-center px-4 pt-6 gap-3 h-full overflow-y-hidden">
				<div key={current.id} className="space-y-3 animate-slideIn">
					<button
						type="button"
						onClick={() => handleChoice("a")}
						className="w-full py-10 px-6 rounded-3xl text-xl leading-6 font-semibold text-center bg-sky-200 text-sky-1000 transition-transform active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
					>
						{current.a}
					</button>

					<p className="text-center text-base text-gray-800">
						{content["workPreferences.orLabel"]}
					</p>

					<button
						type="button"
						onClick={() => handleChoice("b")}
						className="w-full py-10 px-6 rounded-3xl text-xl leading-6 font-semibold text-center bg-sky-800 text-sky-white transition-transform active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
					>
						{current.b}
					</button>
				</div>
			</div>
		</StepLayout>
	);
}
