import { useState } from "react";
import { content } from "../../../content/de";
import { useAppStore } from "../../../store/useAppStore";
import { Step } from "../../../common";
import { StepLayout } from "./StepLayout";

export function SecretTalentStep() {
	const profile = useAppStore((state) => state.profile);
	const setSecretTalent = useAppStore((state) => state.setSecretTalent);
	const nextStep = useAppStore((state) => state.nextStep);
	const [value, setValue] = useState(profile.geheimesTalent);

	function handleNext() {
		setSecretTalent(value);
		nextStep();
	}

	return (
		<StepLayout
			question={content["secretTalent.question"]}
			currentStep={Step.SecretTalent}
			onNext={handleNext}
			onSkip={nextStep}
			nextDisabled={false}
		>
			<div className="rounded-3xl p-5 min-h-48 bg-gray-50 border-2 border-gray-200">
				<textarea
					value={value}
					onChange={(e) => setValue(e.target.value)}
					placeholder={content["secretTalent.placeholder"]}
					className="w-full h-40 bg-transparent text-base resize-none focus:outline-none placeholder:text-gray-300 placeholder:italic"
				/>
			</div>
		</StepLayout>
	);
}
