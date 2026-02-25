import { useState } from "react";
import { content } from "../content/de";
import { useAppState, useAppDispatch } from "../context/AppContext";
import { Step } from "../types";
import { StepLayout } from "./StepLayout";

export function PracticalExperienceStep() {
	const { profile } = useAppState();
	const dispatch = useAppDispatch();
	const [value, setValue] = useState(profile.praktischeErfahrungen);

	function handleNext() {
		dispatch({ type: "SET_PRACTICAL_EXPERIENCE", value });
		dispatch({ type: "NEXT_STEP" });
	}

	return (
		<StepLayout
			question={content.practicalExperience.question}
			subtitle={content.practicalExperience.subtitle}
			currentStep={Step.PracticalExperience}
			onNext={handleNext}
			onSkip={() => dispatch({ type: "NEXT_STEP" })}
			nextDisabled={false}
		>
			<div
				className="rounded-3xl p-5 min-h-48"
				style={{ backgroundColor: "var(--card-fill)" }}
			>
				<textarea
					value={value}
					onChange={(e) => setValue(e.target.value)}
					placeholder={content.practicalExperience.placeholder}
					className="w-full h-40 bg-transparent text-body resize-none focus:outline-none placeholder:text-gray-300 placeholder:italic"
				/>
			</div>
		</StepLayout>
	);
}
