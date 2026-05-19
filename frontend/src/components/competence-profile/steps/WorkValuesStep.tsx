import { content } from "../../../content";
import { StepLayout } from "./StepLayout";
import { SelectableRowButton } from "../../primitives/buttons/SelectableRowButton";
import { useAppStore } from "../../../store/useAppStore";
import { useFlowNavigation } from "../../../routing/useFlowNavigation";
import { workValues } from "./work-values";

export function WorkValuesStep() {
	const { goNext } = useFlowNavigation();
	const profile = useAppStore((state) => state.profile);
	const toggleWorkValue = useAppStore((state) => state.toggleWorkValue);

	return (
		<StepLayout
			question={content["workValues.question"]}
			onNext={goNext}
			onSkip={goNext}
			skipLabel={content["workValues.skipButton.label"]}
			isSkipConfirmDialogOpen={profile.workValues.length === 0}
			skipConfirmTitleKey="skipConfirmDialog.multipleChoice.title"
			skipConfirmDescriptionKey="skipConfirmDialog.multipleChoice.description"
			subtitle={content["common.multiSelect.subline"]}
		>
			<div className="flex flex-col gap-3">
				{workValues.map((value) => {
					const selected = profile.workValues.includes(value.value);
					return (
						<SelectableRowButton
							key={value.value}
							label={value.label}
							selected={selected}
							onClick={() => toggleWorkValue(value.value)}
						/>
					);
				})}
			</div>
		</StepLayout>
	);
}
