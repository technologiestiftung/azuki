import { useRef, useState } from "react";
import { content } from "../../../../content";
import { useAppStore } from "../../../../store/useAppStore";
import { StepLayout } from "../StepLayout";
import { useFlowNavigation } from "../../../../routing/useFlowNavigation";
import { categories } from "./school-subjects";
import { Pill } from "../../../primitives/buttons/Pill";
import { PrimaryThemedButton } from "../../../primitives/buttons/PrimaryThemedButton";
import { InputBottomSheet } from "../../../input-bottom-sheet/InputBottomSheet";

export function SchoolSubjectsStep() {
	const profile = useAppStore((state) => state.profile);
	const toggleSubject = useAppStore((state) => state.toggleSubject);
	const addCustomSubject = useAppStore((state) => state.addCustomSubject);
	const { goNext } = useFlowNavigation();
	const customSubjectsSectionRef = useRef<HTMLDivElement>(null);
	const [inputSheetOpen, setInputSheetOpen] = useState(false);

	const handleAddCustomSubject = (value: string) => {
		const trimmedValue = value.trim();
		if (trimmedValue && !profile.favoriteSubjects.includes(trimmedValue)) {
			addCustomSubject(trimmedValue);
		}
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				customSubjectsSectionRef.current?.scrollIntoView({
					behavior: "smooth",
					block: "start",
				});
			});
		});
	};

	return (
		<StepLayout
			question={content["schoolSubjects.question"]}
			onNext={goNext}
			onSkip={goNext}
			hasSkipButton={false}
			skipLabel={content["schoolSubjects.skipButton.label"]}
			isSkipConfirmDialogOpen={profile.favoriteSubjects.length === 0}
			skipConfirmTitleKey="skipConfirmDialog.multipleChoice.title"
			skipConfirmDescriptionKey="skipConfirmDialog.multipleChoice.description"
			subtitle={content["common.multiSelect.subline"]}
		>
			<div className="flex flex-col gap-8">
				{profile.customSubjects && profile.customSubjects.length > 0 && (
					<div ref={customSubjectsSectionRef} className="scroll-mt-4">
						<h3 className="text-lg font-semibold text-gray-500 mb-2 px-3.5">
							{content["schoolSubjects.customSubject.label"]}
						</h3>
						<div className="flex min-w-0 flex-wrap gap-x-2 gap-y-2.5 rounded-2xl bg-card-fill p-3">
							{profile.customSubjects.map((customSubject: string) => (
								<Pill
									key={customSubject}
									label={customSubject}
									selected={profile.favoriteSubjects.includes(customSubject)}
									onClick={() => toggleSubject(customSubject)}
									ariaLabel={`${customSubject} ${content["schoolSubjects.pill.label.postfix"]}`}
								/>
							))}
							<PrimaryThemedButton
								className="text-lg mt-2"
								onClick={() => setInputSheetOpen(true)}
							>
								<div className="flex items-center gap-2 justify-center">
									<img src="/icons/plus-black.svg" alt="" className="w-6 h-6" />
									{content["schoolSubjects.addCustomSubjectButton.addMore"]}
								</div>
							</PrimaryThemedButton>
						</div>
					</div>
				)}
				{categories.map((category) => (
					<div key={category.name}>
						<div className="flex flex-col gap-2">
							<div key={category.name}>
								<h3 className="text-lg font-semibold text-gray-500 mb-2 px-3.5">
									{category.name}
								</h3>
								<div className="flex min-w-0 flex-wrap gap-x-2 gap-y-2.5 rounded-2xl bg-card-fill p-3">
									{category.subjects.map((item) => (
										<Pill
											key={item.label}
											label={item.label}
											icon={item.icon}
											selected={profile.favoriteSubjects.includes(item.value)}
											onClick={() => toggleSubject(item.value)}
											ariaLabel={`${item.label} ${content["schoolSubjects.pill.label.postfix"]}`}
										/>
									))}
								</div>
							</div>
						</div>
					</div>
				))}
				{profile.customSubjects && profile.customSubjects.length === 0 && (
					<PrimaryThemedButton
						className="text-lg"
						ariaLabel={
							content["schoolSubjects.addCustomSubjectButton.ariaLabel"]
						}
						onClick={() => setInputSheetOpen(true)}
					>
						<div className="flex items-center gap-2 justify-center">
							<img src="/icons/plus-black.svg" alt="" className="w-6 h-6" />
							{content["schoolSubjects.addCustomSubjectButton.label"]}
						</div>
					</PrimaryThemedButton>
				)}
			</div>
			<InputBottomSheet
				open={inputSheetOpen}
				onClose={() => setInputSheetOpen(false)}
				sheetAriaLabel={content["schoolSubjects.bottomSheet.sheetAriaLabel"]}
				inputPlaceholder={
					content["schoolSubjects.bottomSheet.input.addPlaceholder"]
				}
				errorMessage={content["schoolSubjects.bottomSheet.errorMessage"]}
				onSubmit={handleAddCustomSubject}
			/>
		</StepLayout>
	);
}
