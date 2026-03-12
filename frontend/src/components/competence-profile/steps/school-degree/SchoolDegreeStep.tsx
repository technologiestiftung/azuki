import { content } from "../../../../content/de";
import { useAppStore } from "../../../../store/useAppStore";
import { Step, type EducationLevel } from "../../../../common";
import { StepLayout } from "../StepLayout";
import { schoolDegrees } from "./school-degrees";

export function SchoolDegreeStep() {
	const profile = useAppStore((state) => state.profile);
	const setEducationLevel = useAppStore((state) => state.setEducationLevel);
	const nextStep = useAppStore((state) => state.nextStep);

	const inSchool = profile.inSchool;

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
			currentStep={Step.SchoolDegreeStep}
			onNext={nextStep}
			onSkip={nextStep}
			nextDisabled={!profile.educationLevel}
			hasSkipButton={true}
			skipLabel={content["schoolDegree.skipButton.label"]}
		>
			<div className="flex flex-col gap-3">
				{schoolDegrees.map((degree) => (
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
