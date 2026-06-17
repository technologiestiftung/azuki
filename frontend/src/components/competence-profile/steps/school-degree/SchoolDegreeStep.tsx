import { content } from "../../../../content";
import { useAppStore } from "../../../../store/useAppStore";
import { useToastStore } from "../../../../store/useToastStore";
import { type EducationLevel } from "../../../../common";
import { StepLayout } from "../StepLayout";
import { schoolDegrees } from "./school-degrees";
import { useFlowNavigation } from "../../../../routing/useFlowNavigation";
import { Link } from "../../../primitives/links/Link";
import { SelectableCardButton } from "../../../primitives/buttons/SelectableCardButton";

export function SchoolDegreeStep() {
	const profile = useAppStore((state) => state.profile);
	const setEducationLevel = useAppStore((state) => state.setEducationLevel);
	const { goNext } = useFlowNavigation();

	const inSchool = profile.inSchool;

	const filteredDegrees = schoolDegrees.filter((degree) => {
		if (inSchool) {
			return degree.value !== "none" && degree.value !== "foreign_degree";
		}
		return true;
	});

	function handleSelect(value: string) {
		setEducationLevel(value as EducationLevel);
	}

	const handleNext = () => {
		if (profile.educationLevel === null) {
			useToastStore.getState().showOrShake("toast.schoolDegree.description");
			return;
		}
		goNext();
	};

	return (
		<StepLayout
			question={
				inSchool
					? content["schoolDegree.question.inSchool"]
					: content["schoolDegree.question"]
			}
			onNext={handleNext}
			onSkip={goNext}
			hasSkipButton={false}
			subtitle={content["common.singleSelect.subline"]}
		>
			<div className="flex flex-col gap-3">
				{filteredDegrees.map((degree) => (
					<SelectableCardButton
						key={degree.value}
						label={degree.label}
						selected={profile.educationLevel === degree.value}
						onClick={() => {
							handleSelect(degree.value);
							if (degree.value !== "foreign_degree") {
								goNext();
							}
						}}
					>
						{profile.educationLevel === "foreign_degree" &&
							degree.value === "foreign_degree" && (
								<Link
									href={content["schoolDegree.link.foreign.href"]}
									label={content["schoolDegree.link.foreign.label"]}
									target="_blank"
									rel="noopener noreferrer"
									variant="primary"
									showIcon={true}
								/>
							)}
					</SelectableCardButton>
				))}
			</div>
		</StepLayout>
	);
}
