import { content } from "../../../content/de";
import { useAppStore } from "../../../store/useAppStore";
import { Step, type WorkPreferenceChoice } from "../../../common";
import { ProgressBar } from "../progress-bar/ProgressBar";
import { QuestionBubble } from "../question-bubble/QuestionBubble";
import { SecondaryButton } from "../../primitives/buttons/SecondaryButton";
import { BackButton } from "../../back-button/BackButton";

export function WorkPreferencesStep() {
	const workPrefSubIndex = useAppStore((state) => state.workPrefSubIndex);
	const setWorkPreference = useAppStore((state) => state.setWorkPreference);
	const setWorkPrefSubIndex = useAppStore((state) => state.setWorkPrefSubIndex);
	const nextStep = useAppStore((state) => state.nextStep);
	const prevStep = useAppStore((state) => state.prevStep);
	const pairs = content["workPreferences.pairs"];
	const current = pairs[workPrefSubIndex];

	function handleChoice(choice: WorkPreferenceChoice) {
		setWorkPreference(current.id, choice);
		if (workPrefSubIndex < pairs.length - 1) {
			setWorkPrefSubIndex(workPrefSubIndex + 1);
		} else {
			nextStep();
		}
	}

	function handleSkip() {
		if (workPrefSubIndex < pairs.length - 1) {
			setWorkPrefSubIndex(workPrefSubIndex + 1);
		} else {
			nextStep();
		}
	}

	return (
		<div className="flex flex-col min-h-[100dvh]">
			<div className="flex items-center gap-3 px-4 pt-2 pb-1">
				<BackButton
					onClick={() => {
						if (workPrefSubIndex > 0) {
							setWorkPrefSubIndex(workPrefSubIndex - 1);
						} else {
							prevStep();
						}
					}}
				/>
				<div className="flex-1">
					<ProgressBar currentStep={Step.WorkPreferences} />
				</div>
			</div>

			<div className="px-4 pt-8">
				<QuestionBubble>
					<h2 className="text-h3 font-bold text-white">
						{content["workPreferences.question"]}
					</h2>
				</QuestionBubble>
			</div>

			<div className="flex-1 flex flex-col justify-center px-4 pt-6 gap-3">
				<div
					key={current.id}
					className="space-y-3 animate-slideIn"
				>
					<button
						onClick={() => handleChoice("a")}
						className="w-full py-10 px-6 rounded-3xl text-h4 font-semibold text-center bg-sky-400/30 text-sky-1000 transition-transform active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
					>
						{current.a}
					</button>

					<p className="text-center text-body text-gray-400">
						{content["workPreferences.orLabel"]}
					</p>

					<button
						onClick={() => handleChoice("b")}
						className="w-full py-10 px-6 rounded-3xl text-h4 font-semibold text-center bg-sky-1000 text-white transition-transform active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
					>
						{current.b}
					</button>
				</div>
			</div>

			<div className="flex flex-col justify-center px-4 pb-8 pt-4 space-y-2">
				<SecondaryButton onClick={handleSkip} className="w-full">
					{content["navigation.skip"]}
				</SecondaryButton>
			</div>
		</div>
	);
}
