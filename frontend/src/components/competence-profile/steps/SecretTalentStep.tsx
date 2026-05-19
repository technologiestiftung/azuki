import { useState } from "react";
import { content } from "../../../content";
import { useAppStore } from "../../../store/useAppStore";
import { StepLayout } from "./StepLayout";
import { useFlowNavigation } from "../../../routing/useFlowNavigation";

export function SecretTalentStep() {
	const profile = useAppStore((state) => state.profile);
	const setSecretTalent = useAppStore((state) => state.setSecretTalent);
	const { goNext } = useFlowNavigation();
	const [value, setValue] = useState(profile.secretTalent);

	function handleNext() {
		setSecretTalent(value);
		goNext();
	}

	return (
		<StepLayout
			question={content["secretTalent.question"]}
			onNext={handleNext}
			onSkip={goNext}
			isSkipConfirmDialogOpen={!value?.trim()}
			skipConfirmTitleKey="skipConfirmDialog.textInput.title"
			skipConfirmDescriptionKey="skipConfirmDialog.textInput.description"
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
