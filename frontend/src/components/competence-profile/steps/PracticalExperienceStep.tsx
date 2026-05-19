import { useState } from "react";
import { content } from "../../../content";
import { useAppStore } from "../../../store/useAppStore";
import { StepLayout } from "./StepLayout";
import { useFlowNavigation } from "../../../routing/useFlowNavigation";

export function PracticalExperienceStep() {
	const profile = useAppStore((state) => state.profile);
	const setPracticalExperience = useAppStore(
		(state) => state.setPracticalExperience,
	);
	const { goNext } = useFlowNavigation();
	const [value, setValue] = useState(profile.practicalExperience);

	function handleNext() {
		setPracticalExperience(value);
		goNext();
	}

	return (
		<StepLayout
			question={content["practicalExperience.question"]}
			subtitle={content["practicalExperience.subtitle"]}
			onNext={handleNext}
			onSkip={goNext}
			isNextDisabled={false}
			isSkipConfirmDialogOpen={!value?.trim()}
			skipConfirmTitleKey="skipConfirmDialog.textInput.title"
			skipConfirmDescriptionKey="skipConfirmDialog.textInput.description"
		>
			<div className="rounded-3xl p-5 min-h-48 bg-gray-50 border-2 border-gray-200">
				<textarea
					value={value}
					onChange={(e) => setValue(e.target.value)}
					placeholder={content["practicalExperience.placeholder"]}
					className="w-full h-40 bg-transparent text-base resize-none focus:outline-none placeholder:text-gray-300 placeholder:italic"
				/>
			</div>
		</StepLayout>
	);
}
