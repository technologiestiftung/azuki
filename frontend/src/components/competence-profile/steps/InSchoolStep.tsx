import { useState } from "react";
import { content } from "../../../content/de";
import { useAppStore } from "../../../store/useAppStore";
import { Step } from "../../../common";
import { StepLayout } from "./StepLayout";

export function InSchoolStep() {
	const nextStep = useAppStore((state) => state.nextStep);
	const [selected, setSelected] = useState<string | null>(null);

	return (
		<StepLayout
			question={content["inSchool.question"]}
			currentStep={Step.InSchool}
			onNext={nextStep}
			nextDisabled={!selected}
			showSkip={false}
		>
			<div className="space-y-3">
				{content["inSchool.options"].map((option) => (
					<button
						className={`text-left px-5 py-4 w-full rounded-2xl border-2 transition-colors text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 ${
							selected === option.value
								? "border-sky-300 bg-sky-400/28"
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
