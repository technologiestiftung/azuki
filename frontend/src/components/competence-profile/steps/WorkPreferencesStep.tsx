import { useLayoutEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { content } from "../../../content/de";
import { useAppStore } from "../../../store/useAppStore";
import { type WorkPreferenceChoice } from "../../../common";
import { StepLayout } from "./StepLayout";
import { useFlowNavigation } from "../../../routing/useFlowNavigation";
import { parseHashCardIndex } from "../../../routing/routes";

export function WorkPreferencesStep() {
	const { pathname, hash } = useLocation();
	const navigate = useNavigate();
	const setWorkPreference = useAppStore((state) => state.setWorkPreference);
	const { goNext } = useFlowNavigation();
	const pairs = content["workPreferences.pairs"];
	const pairIndex = Math.min(
		parseHashCardIndex(hash),
		Math.max(0, pairs.length - 1),
	);
	const current = pairs[pairIndex];

	useLayoutEffect(() => {
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

	return (
		<StepLayout
			question={content["workPreferences.question"]}
			onNext={goNext}
			onSkip={handleSkip}
			hasSkipButton={true}
			hasNextButton={false}
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
