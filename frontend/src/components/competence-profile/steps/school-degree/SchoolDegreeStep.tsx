import { content } from "../../../../content/de";
import { useAppStore } from "../../../../store/useAppStore";
import { type EducationLevel } from "../../../../common";
import { StepLayout } from "../StepLayout";
import { schoolDegrees } from "./school-degrees";
import { useFlowNavigation } from "../../../../routing/useFlowNavigation";

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

	return (
		<StepLayout
			question={
				inSchool
					? content["schoolDegree.question.inSchool"]
					: content["schoolDegree.question"]
			}
			onNext={goNext}
			onSkip={goNext}
			nextDisabled={!profile.educationLevel}
			hasSkipButton={false}
		>
			<div className="flex flex-col gap-3">
				{filteredDegrees.map((degree) => (
					<button
						className={`min-h-[52px] text-left p-3 w-full rounded-xl border-2 text-gray-700 text-lg font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 ${
							profile.educationLevel === degree.value
								? "border-sky-300 bg-sky-50 text-sky-700"
								: "border-gray-200 bg-transparent"
						}`}
						key={degree.value}
						onClick={() => handleSelect(degree.value)}
					>
						{degree.label}
					</button>
				))}
			</div>
		</StepLayout>
	);
}
