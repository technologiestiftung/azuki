import { useState } from "react";
import { content } from "../content/de";
import { useAppDispatch } from "../context/AppContext";
import { Step } from "../types";
import { StepLayout } from "./StepLayout";

export function InSchoolStep() {
	const dispatch = useAppDispatch();
	const [selected, setSelected] = useState<string | null>(null);

	return (
		<StepLayout
			question={content.inSchool.question}
			currentStep={Step.InSchool}
			onNext={() => dispatch({ type: "NEXT_STEP" })}
			nextDisabled={!selected}
			showSkip={false}
		>
			<div className="space-y-3">
				{content.inSchool.options.map((option) => (
					<button
						key={option.value}
						onClick={() => setSelected(option.value)}
						className="w-full text-left px-5 py-4 rounded-2xl border-2 transition-colors text-body"
						style={{
							borderColor:
								selected === option.value
									? "var(--theme-primary-filled)"
									: "#e5e7eb",
							backgroundColor:
								selected === option.value
									? "var(--theme-subtle)"
									: "transparent",
						}}
					>
						{option.label}
					</button>
				))}
			</div>
		</StepLayout>
	);
}
