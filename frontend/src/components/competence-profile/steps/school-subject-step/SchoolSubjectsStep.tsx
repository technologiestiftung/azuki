import { content } from "../../../../content/de";
import { useAppStore } from "../../../../store/useAppStore";
import { Step } from "../../../../common";
import { StepLayout } from "../StepLayout";
import { categories } from "./school-subjects";

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
			showSkip={true}
			skipLabel={content["schoolSubjects.skipButton.label"]}
		>
			<div className="flex flex-col gap-8">
				{categories.map((category) => (
					<div key={category.name}>
						<h3 className="text-lg font-semibold text-gray-500 mb-2 px-3.5">
							{category.name}
						</h3>
						<div className="flex flex-col gap-3">
							{category.subjects.map((subject) => {
								const selected = profile.favoriteSubjects.includes(
									subject.value,
								);
								return (
									<button
										key={subject.value}
										onClick={() => toggleSubject(subject.value)}
										className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 ${
											selected
												? "border-sky-300 bg-sky-50"
												: "border-gray-200 bg-transparent"
										}`}
									>
										<span className="text-lg font-medium text-gray-700">
											{subject.label}
										</span>
										<div
											className={`w-6 h-6 rounded-[5px] border-2 flex items-center justify-center transition-colors ${
												selected
													? "border-sky-300 bg-sky-300"
													: "border-gray-300 bg-transparent"
											}`}
										>
											{selected && (
												<img
													src="/icons/check-white.svg"
													alt=""
													width={18}
													height={18}
												/>
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
