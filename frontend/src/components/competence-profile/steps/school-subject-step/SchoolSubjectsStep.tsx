import { content } from "../../../../content/de";
import { useAppStore } from "../../../../store/useAppStore";
import { StepLayout } from "../StepLayout";
import { useFlowNavigation } from "../../../../routing/useFlowNavigation";
import { categories } from "./school-subjects";
import { SelectableRowButton } from "../../../primitives/buttons/SelectableRowButton";

export function SchoolSubjectsStep() {
	const profile = useAppStore((state) => state.profile);
	const toggleSubject = useAppStore((state) => state.toggleSubject);
	const { goNext } = useFlowNavigation();

	return (
		<StepLayout
			question={content["schoolSubjects.question"]}
			onNext={goNext}
			onSkip={goNext}
			hasSkipButton={false}
			skipLabel={content["schoolSubjects.skipButton.label"]}
			isSkipConfirmDialogOpen={profile.favoriteSubjects.length === 0}
			subtitle={content["common.multiSelect.subline"]}
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
									<SelectableRowButton
										key={subject.value}
										label={subject.label}
										selected={selected}
										onClick={() => toggleSubject(subject.value)}
									/>
								);
							})}
						</div>
					</div>
				))}
			</div>
		</StepLayout>
	);
}
