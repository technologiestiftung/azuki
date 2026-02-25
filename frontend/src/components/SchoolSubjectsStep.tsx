import { content } from "../content/de";
import { useAppState, useAppDispatch } from "../context/AppContext";
import { Step } from "../types";
import { StepLayout } from "./StepLayout";

export function SchoolSubjectsStep() {
	const { profile } = useAppState();
	const dispatch = useAppDispatch();

	return (
		<StepLayout
			question={content.schoolSubjects.question}
			currentStep={Step.SchoolSubjects}
			onNext={() => dispatch({ type: "NEXT_STEP" })}
			onSkip={() => dispatch({ type: "NEXT_STEP" })}
			nextDisabled={profile.lieblingsfaecher.length === 0}
		>
			<div className="space-y-6">
				{content.schoolSubjects.categories.map((category) => (
					<div key={category.name}>
						<h3 className="text-caption font-semibold text-gray-500 mb-2">
							{category.name}
						</h3>
						<div className="space-y-2">
							{category.subjects.map((subject) => {
								const selected = profile.lieblingsfaecher.includes(subject);
								return (
									<button
										key={subject}
										onClick={() =>
											dispatch({ type: "TOGGLE_SUBJECT", subject })
										}
										className="w-full flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-colors text-body"
										style={{
											borderColor: selected
												? "var(--theme-primary-filled)"
												: "#e5e7eb",
											backgroundColor: selected
												? "var(--theme-subtle)"
												: "transparent",
										}}
									>
										<span>{subject}</span>
										<div
											className="w-6 h-6 rounded border-2 flex items-center justify-center transition-colors"
											style={{
												borderColor: selected
													? "var(--theme-primary-filled)"
													: "#d1d5db",
												backgroundColor: selected
													? "var(--theme-primary-filled)"
													: "transparent",
											}}
										>
											{selected && (
												<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
													<path d="M3 7l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
												</svg>
											)}
										</div>
									</button>
								);
							})}
						</div>
					</div>
				))}
			</div>
		</StepLayout>
	);
}
