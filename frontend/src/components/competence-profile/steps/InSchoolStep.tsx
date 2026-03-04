import { useState } from "react";
import { content } from "../../../content/de";
import { useAppStore } from "../../../store/useAppStore";
import { Step } from "../../../common";
import { StepLayout } from "./StepLayout";

export function InSchoolStep() {
	const nextStep = useAppStore((state) => state.nextStep);
	const [selected, setSelected] = useState<string | null>(null);

	const inSchoolOptions: { value: string; label: string }[] = [
		{ value: "yes", label: content["inSchool.option.yes.label"] },
		{ value: "no", label: content["inSchool.option.no.label"] },
	];
	return (
		<StepLayout
			question={content["inSchool.question"]}
			currentStep={Step.InSchool}
			onNext={nextStep}
			nextDisabled={!selected}
			showSkip={false}
		>
			<div className="flex flex-col gap-3">
				{inSchoolOptions.map((option) => (
					<button
						className={`text-left p-3 w-full rounded-xl border-2 text-gray-700 text-lg font-normal focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 ${
							selected === option.value
								? "border-sky-300 bg-sky-50"
								: "border-gray-200 bg-transparent"
						}`}
						key={option.value}
						onClick={() => setSelected(option.value)}
					>
						{option.label}
					</button>
				))}
			</div>
		</StepLayout>
	);
}
