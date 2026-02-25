import { content } from "../content/de";
import { useAppState, useAppDispatch } from "../context/AppContext";
import { Step, type SchoolDegree } from "../types";
import { StepLayout } from "./StepLayout";

export function SchoolDegreeStep() {
	const { profile } = useAppState();
	const dispatch = useAppDispatch();

	function handleSelect(value: string) {
		dispatch({ type: "SET_SCHOOL_DEGREE", value: value as SchoolDegree });
	}

	return (
		<StepLayout
			question={content.schoolDegree.question}
			currentStep={Step.SchoolDegree}
			onNext={() => dispatch({ type: "NEXT_STEP" })}
			nextDisabled={!profile.schulabschluss}
			showSkip={false}
		>
			<div className="space-y-3">
				{content.schoolDegree.options.map((option) => (
					<button
						key={option.value}
						onClick={() => handleSelect(option.value)}
						className="w-full text-left px-5 py-4 rounded-2xl border-2 transition-colors text-body"
						style={{
							borderColor:
								profile.schulabschluss === option.value
									? "var(--theme-primary-filled)"
									: "#e5e7eb",
							backgroundColor:
								profile.schulabschluss === option.value
									? "var(--theme-subtle)"
									: "transparent",
						}}
					>
						{option.label}
					</button>
				))}
			</div>

			<button
				onClick={() => {
					dispatch({ type: "SET_SCHOOL_DEGREE", value: "unknown" });
					dispatch({ type: "NEXT_STEP" });
				}}
				className="w-full mt-6 text-body text-gray-400 text-center"
			>
				{content.schoolDegree.unknownLabel}
			</button>
		</StepLayout>
	);
}
