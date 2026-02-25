import { TOTAL_QUESTIONNAIRE_STEPS, QUESTIONNAIRE_STEPS, Step } from "../types";

interface ProgressBarProps {
	currentStep: Step;
}

export function ProgressBar({ currentStep }: ProgressBarProps) {
	const stepIndex = QUESTIONNAIRE_STEPS.indexOf(currentStep);
	const progress = stepIndex >= 0 ? (stepIndex + 1) / TOTAL_QUESTIONNAIRE_STEPS : 0;

	return (
		<div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
			<div
				className="h-full rounded-full transition-all duration-500 ease-out"
				style={{
					width: `${progress * 100}%`,
					background: "var(--theme-primary-filled)",
				}}
			/>
		</div>
	);
}
