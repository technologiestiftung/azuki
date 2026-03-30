import { content } from "../../../content/de";
import { StepLayout } from "./StepLayout";
import { SelectableRowButton } from "../../primitives/buttons/SelectableRowButton";
import { useAppStore } from "../../../store/useAppStore";
import { useFlowNavigation } from "../../../routing/useFlowNavigation";

const workValues: { value: string; label: string }[] = [
	{ value: "good_salary", label: content["workValues.option.goodSalary"] },
	{ value: "people_work", label: content["workValues.option.peopleWork"] },
	{ value: "teamwork_value", label: content["workValues.option.teamWork"] },
	{
		value: "autonomy_responsibility",
		label: content["workValues.option.autonomyResponsibility"],
	},
	{
		value: "flexible_hours",
		label: content["workValues.option.flexibleHours"],
	},
	{ value: "stability", label: content["workValues.option.stability"] },
	{
		value: "modern_technology",
		label: content["workValues.option.modernTechnology"],
	},
	{
		value: "short_distance",
		label: content["workValues.option.shortDistance"],
	},
	{ value: "career", label: content["workValues.option.career"] },
	{ value: "benefits", label: content["workValues.option.benefits"] },
	{ value: "remote", label: content["workValues.option.remote"] },
];

export function WorkValuesStep() {
	const { goNext } = useFlowNavigation();
	const profile = useAppStore((state) => state.profile);
	const toggleWorkValue = useAppStore((state) => state.toggleWorkValue);

	return (
		<StepLayout
			question={content["workValues.question"]}
			onNext={goNext}
			onSkip={goNext}
			nextDisabled={profile.workValues.length === 0}
			hasSkipButton={true}
			skipLabel={content["workValues.skipButton.label"]}
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
