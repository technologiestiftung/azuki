import { content } from "../../../content/de";
import { useAppStore } from "../../../store/useAppStore";
import { Step, type SchoolDegree } from "../../../common";
import { StepLayout } from "./StepLayout";

export function SchoolDegreeStep() {
	const profile = useAppStore((state) => state.profile);
	const setSchoolDegree = useAppStore((state) => state.setSchoolDegree);
	const nextStep = useAppStore((state) => state.nextStep);

	function handleSelect(value: string) {
		setSchoolDegree(value as SchoolDegree);
	}

	return (
		<StepLayout
			question={content["schoolDegree.question"]}
			currentStep={Step.SchoolDegreeStep}
			onNext={nextStep}
			onSkip={nextStep}
			nextDisabled={!profile.schulabschluss}
			showSkip={true}
		>
			<div className="space-y-3">
				{content["schoolDegree.options"].map((option) => (
					<button
						className={`text-left px-5 py-4 w-full rounded-2xl border-2 transition-colors text-body focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 ${
							profile.schulabschluss === option.value
								? "border-sky-300 bg-sky-400/28"
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
