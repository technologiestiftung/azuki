import { content } from "../../../content/de";
import { useAppStore } from "../../../store/useAppStore";
import { Step, type EducationLevel } from "../../../common";
import { StepLayout } from "./StepLayout";

export function SchoolDegreeStep() {
	const profile = useAppStore((state) => state.profile);
	const setEducationLevel = useAppStore((state) => state.setEducationLevel);
	const nextStep = useAppStore((state) => state.nextStep);

	function handleSelect(value: string) {
		setEducationLevel(value as EducationLevel);
	}

	return (
		<StepLayout
			question={content["schoolDegree.question"]}
			currentStep={Step.SchoolDegreeStep}
			onNext={nextStep}
			onSkip={nextStep}
			nextDisabled={!profile.educationLevel}
			showSkip={true}
		>
			<div className="flex flex-col gap-3">
				{content["schoolDegree.options"].map((option) => (
					<button
						className={`text-left p-3 w-full rounded-xl border-2 text-gray-700 text-lg font-normal focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 ${
							profile.educationLevel === option.value
								? "border-sky-300 bg-sky-50"
								: "border-gray-200 bg-transparent"
						}`}
						key={option.value}
						onClick={() => handleSelect(option.value)}
					>
						{option.label}
					</button>
				))}
			</div>
		</StepLayout>
	);
}
