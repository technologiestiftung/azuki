import { content } from "../../../content/de";
import { useAppStore } from "../../../store/useAppStore";
import { Step } from "../../../common";
import { StepLayout } from "./StepLayout";

export function SchoolSubjectsStep() {
	const profile = useAppStore((state) => state.profile);
	const toggleSubject = useAppStore((state) => state.toggleSubject);
	const nextStep = useAppStore((state) => state.nextStep);

	return (
		<StepLayout
			question={content["schoolSubjects.question"]}
			currentStep={Step.SchoolSubjects}
			onNext={nextStep}
			onSkip={nextStep}
			nextDisabled={profile.favoriteSubjects.length === 0}
		>
			<div className="space-y-6">
				{content["schoolSubjects.categories"].map((category) => (
					<div key={category.name}>
						<h3 className="text-sm font-semibold text-gray-500 mb-2">
							{category.name}
						</h3>
						<div className="space-y-2">
							{category.subjects.map((subject) => {
								const selected = profile.favoriteSubjects.includes(
									subject.value,
								);
								return (
									<button
										key={subject.value}
										onClick={() => toggleSubject(subject.value)}
										className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-colors text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 ${
											selected
												? "border-sky-300 bg-sky-400/28"
												: "border-gray-200 bg-transparent"
										}`}
									>
										<span>{subject.label}</span>
										<div
											className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
												selected
													? "border-sky-300 bg-sky-300"
													: "border-gray-300 bg-transparent"
											}`}
										>
											{selected && (
												<svg
													width="14"
													height="14"
													viewBox="0 0 14 14"
													fill="none"
												>
													<path
														d="M3 7l3 3 5-5"
														stroke="#fff"
														strokeWidth="2"
														strokeLinecap="round"
														strokeLinejoin="round"
													/>
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
