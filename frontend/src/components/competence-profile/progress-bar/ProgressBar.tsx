import {
	TOTAL_QUESTIONNAIRE_STEPS,
	QUESTIONNAIRE_STEPS,
	Step,
} from "../../../common";

interface ProgressBarProps {
	currentStep: Step;
}

export function ProgressBar({ currentStep }: ProgressBarProps) {
	const stepIndex = QUESTIONNAIRE_STEPS.indexOf(currentStep);
	const progress =
		stepIndex >= 0 ? (stepIndex + 1) / TOTAL_QUESTIONNAIRE_STEPS : 0;

	return (
		<div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
			<div
				className="h-full bg-sky-300 rounded-full transition-all duration-500 ease-out"
				style={{
					width: `${progress * 100}%`,
				}}
			/>
		</div>
	);
}
