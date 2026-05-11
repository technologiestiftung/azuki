import { content } from "../../../content/de";
import { StepLayout } from "./StepLayout";
import { SelectableRowButton } from "../../primitives/buttons/SelectableRowButton";
import { useAppStore } from "../../../store/useAppStore";
import { useFlowNavigation } from "../../../routing/useFlowNavigation";

const WorkExpectations: { value: string; label: string }[] = [
	{
		value: "good_salary",
		label: content["workExpectations.option.goodSalary"],
	},
	{
		value: "people_work",
		label: content["workExpectations.option.peopleWork"],
	},
	{
		value: "teamwork_value",
		label: content["workExpectations.option.teamWork"],
	},
	{
		value: "autonomy_responsibility",
		label: content["workExpectations.option.autonomyResponsibility"],
	},
	{
		value: "flexible_hours",
		label: content["workExpectations.option.flexibleHours"],
	},
	{ value: "stability", label: content["workExpectations.option.stability"] },
	{
		value: "modern_technology",
		label: content["workExpectations.option.modernTechnology"],
	},
	{
		value: "short_distance",
		label: content["workExpectations.option.shortDistance"],
	},
	{ value: "career", label: content["workExpectations.option.career"] },
	{ value: "remote", label: content["workExpectations.option.remote"] },
];

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
				{WorkExpectations.map((value) => {
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
