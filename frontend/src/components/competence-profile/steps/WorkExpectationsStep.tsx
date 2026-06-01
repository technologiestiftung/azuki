import { content } from "../../../content";
import { StepLayout } from "./StepLayout";
import { SelectableRowButton } from "../../primitives/buttons/SelectableRowButton";
import { useAppStore } from "../../../store/useAppStore";
import { useFlowNavigation } from "../../../routing/useFlowNavigation";
import { workExpectationOptions } from "./work-expectation-options";

export function WorkExpectationsStep() {
	const { goNext } = useFlowNavigation();
	const profile = useAppStore((state) => state.profile);
	const toggleWorkExpectation = useAppStore(
		(state) => state.toggleWorkExpectation,
	);

	return (
		<StepLayout
			question={content["workExpectations.question"]}
			onNext={goNext}
			onSkip={goNext}
			skipLabel={content["workExpectations.skipButton.label"]}
			isSkipConfirmDialogOpen={profile.workExpectations.length === 0}
			skipConfirmTitleKey="skipConfirmDialog.multipleChoice.title"
			skipConfirmDescriptionKey="skipConfirmDialog.multipleChoice.description"
			subtitle={content["common.multiSelect.subline"]}
		>
			<div className="flex flex-col gap-3">
				{workExpectationOptions.map((value) => {
					const selected = profile.workExpectations.includes(value.value);
					return (
						<SelectableRowButton
							key={value.value}
							label={value.label}
							selected={selected}
							onClick={() => toggleWorkExpectation(value.value)}
						/>
					);
				})}
			</div>
		</StepLayout>
	);
}
