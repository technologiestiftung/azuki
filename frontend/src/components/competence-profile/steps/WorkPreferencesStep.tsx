import { content } from "../../../content/de";
import { useAppStore } from "../../../store/useAppStore";
import { Step, type WorkPreferenceChoice } from "../../../common";
import { StepLayout } from "./StepLayout";

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
		handleSkip();
	}

	function handleSkip() {
		if (workPrefSubIndex < pairs.length - 1) {
			setWorkPrefSubIndex(workPrefSubIndex + 1);
		} else {
			nextStep();
		}
	}

	function handleBack() {
		if (workPrefSubIndex > 0) {
			setWorkPrefSubIndex(workPrefSubIndex - 1);
		} else {
			prevStep();
		}
	}

	return (
		<StepLayout
			question={content["workPreferences.question"]}
			currentStep={Step.WorkPreferences}
			onNext={nextStep}
			onSkip={handleSkip}
			onBack={handleBack}
			hasSkipButton={true}
			hasNextButton={false}
		>
			<div className="flex flex-col justify-center px-4 pt-6 gap-3 h-full overflow-y-hidden">
				<div key={current.id} className="space-y-3 animate-slideIn">
					<button
						onClick={() => handleChoice("a")}
						className="w-full py-10 px-6 rounded-3xl text-xl leading-6 font-semibold text-center bg-sky-200 text-sky-1000 transition-transform active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
					>
						{current.a}
					</button>

					<p className="text-center text-base text-gray-800">
						{content["workPreferences.orLabel"]}
					</p>

					<button
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
