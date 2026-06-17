import { content } from "../../../content";
import { useAppStore } from "../../../store/useAppStore";
import { useToastStore } from "../../../store/useToastStore";
import { StepLayout } from "./StepLayout";
import { useFlowNavigation } from "../../../routing/useFlowNavigation";
import { SelectableCardButton } from "../../primitives/buttons/SelectableCardButton";

export function InSchoolStep() {
	const profile = useAppStore((state) => state.profile);
	const setInSchool = useAppStore((state) => state.setInSchool);
	const { goNext } = useFlowNavigation();

	const inSchoolOptions: { value: boolean; label: string }[] = [
		{ value: true, label: content["inSchool.option.yes.label"] },
		{ value: false, label: content["inSchool.option.no.label"] },
	];

	const handleNext = () => {
		if (profile.inSchool === null) {
			useToastStore.getState().showOrShake("toast.inSchool.description");
			return;
		}
		goNext();
	};

	return (
		<StepLayout
			question={content["inSchool.question"]}
			onNext={handleNext}
			onSkip={goNext}
			hasSkipButton={false}
			subtitle={content["common.singleSelect.subline"]}
		>
			<div className="flex flex-col gap-3">
				{inSchoolOptions.map((option) => (
					<SelectableCardButton
						label={option.label}
						selected={profile.inSchool === option.value}
						key={option.value.toString()}
						onClick={() => {
							setInSchool(option.value);
							setTimeout(() => {
								goNext();
							}, 500);
						}}
					/>
				))}
			</div>
		</StepLayout>
	);
}
