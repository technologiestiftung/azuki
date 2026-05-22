import { useState } from "react";
import { content } from "../../../../content";
import { useAppStore } from "../../../../store/useAppStore";
import { StepLayout } from "../StepLayout";
import { useFlowNavigation } from "../../../../routing/useFlowNavigation";
import { Pill } from "../../../primitives/buttons/Pill";
import { PrimaryThemedButton } from "../../../primitives/buttons/PrimaryThemedButton";
import { InputBottomSheet } from "../../../input-bottom-sheet/InputBottomSheet";
import { RatingBottomSheet } from "./RatingBottomSheet";

export function PracticalExperienceStep() {
	const profile = useAppStore((state) => state.profile);
	const addPracticalExperience = useAppStore(
		(state) => state.addPracticalExperience,
	);
	const togglePracticalExperience = useAppStore(
		(state) => state.togglePracticalExperience,
	);
	const { goNext } = useFlowNavigation();
	const [inputSheetOpen, setInputSheetOpen] = useState(false);
	const [selectedExperience, setSelectedExperience] = useState<string | null>(
		null,
	);
	const [ratingSheetOpen, setRatingSheetOpen] = useState(false);
	const [pendingDescription, setPendingDescription] = useState("");
	const [pendingSelectedExperienceId, setPendingSelectedExperienceId] =
		useState<string | null>(null);
	const [pendingSelectedExperienceLabel, setPendingSelectedExperienceLabel] =
		useState<string | null>(null);

	function handleNext() {
		goNext();
	}

	function resetPendingEntry() {
		setPendingDescription("");
		setPendingSelectedExperienceId(null);
		setPendingSelectedExperienceLabel(null);
	}

	function closeRatingSheet() {
		setRatingSheetOpen(false);
		resetPendingEntry();
	}

	const experienceSuggestions = [
		{
			label: "Zuhause helfen",
			value: "home-help",
			heading: content["practicalExperience.bottomSheet.addHomeHelp.title"],
			inputPlaceholder:
				content["practicalExperience.bottomSheet.input.homeHelp.placeholder"],
		},
		{
			label: "Schule",
			value: "school",
			heading: content["practicalExperience.bottomSheet.school.title"],
			inputPlaceholder:
				content["practicalExperience.bottomSheet.input.school.placeholder"],
		},
		{
			label: "Nachbarschaft",
			value: "neighborhood",
			heading: content["practicalExperience.bottomSheet.addNeighborhood.title"],
			inputPlaceholder:
				content[
					"practicalExperience.bottomSheet.input.neighborhood.placeholder"
				],
		},
		{
			label: "Verein",
			value: "club",
			heading: content["practicalExperience.bottomSheet.addClub.title"],
			inputPlaceholder:
				content["practicalExperience.bottomSheet.input.club.placeholder"],
		},
		{
			label: "Praktikum",
			value: "internship",
			heading: content["practicalExperience.bottomSheet.addInternship.title"],
			inputPlaceholder:
				content["practicalExperience.bottomSheet.input.internship.placeholder"],
		},
		{
			label: "Job",
			value: "job",
			heading: content["practicalExperience.bottomSheet.addJob.title"],
			inputPlaceholder:
				content["practicalExperience.bottomSheet.input.job.placeholder"],
		},
	];

	const selectedSuggestion = experienceSuggestions.find(
		(item) => item.value === selectedExperience,
	);

	return (
		<StepLayout
			question={content["practicalExperience.question"]}
			subtitle={content["practicalExperience.subtitle"]}
			onNext={handleNext}
			onSkip={goNext}
			isNextDisabled={false}
			isSkipConfirmDialogOpen={false}
			skipConfirmTitleKey="skipConfirmDialog.textInput.title"
			skipConfirmDescriptionKey="skipConfirmDialog.textInput.description"
		>
			<div className="overflow-y-auto">
				{profile.practicalExperiences.length > 0 && (
					<div className="flex flex-col gap-2">
						<h3 className="text-lg font-semibold text-gray-500 px-3.5 shrink-0">
							{content["practicalExperience.suggestion.addedByYouLabel"]}
						</h3>
						<div className="flex h-full min-h-0 w-full flex-1 flex-col rounded-3xl bg-card-fill p-3 mb-3">
							<div className="min-h-0 flex-1 overflow-y-auto">
								<ul className="flex flex-wrap gap-x-2 gap-y-2">
									{profile.practicalExperiences.map((entry) => (
										<Pill
											key={entry.id}
											selected={profile.selectedPracticalExperienceIds.includes(
												entry.id,
											)}
											onClick={() => {
												togglePracticalExperience(entry.id);
											}}
											ariaLabel={entry.description}
											className="text-left"
										>
											{entry.selectedExperienceLabel
												? `${entry.selectedExperienceLabel}: ${entry.description}`
												: entry.description}
										</Pill>
									))}
								</ul>
							</div>
						</div>
					</div>
				)}
				<h3 className="text-lg font-semibold text-gray-500 px-3.5 mb-2 shrink-0">
					{content["practicalExperience.suggestion.label"]}
				</h3>
				<div className="flex w-full flex-1 flex-col rounded-3xl bg-card-fill p-3 mb-3">
					<>
						<div className="">
							<ul className="flex flex-wrap gap-x-2 gap-y-2">
								{experienceSuggestions.map((item) => (
									<Pill
										key={item.value}
										onClick={() => {
											setSelectedExperience(item.value);
											setInputSheetOpen(true);
										}}
										ariaLabel={`${item.label} ${content["practicalExperience.pill.label.postfix"]}`}
										className="text-left"
									>
										{item.label}
										<img
											src="/icons/plus-black.svg"
											alt=""
											className="w-6 h-6"
										/>
									</Pill>
								))}
							</ul>
						</div>
						<PrimaryThemedButton
							className="mt-[18px] shrink-0"
							onClick={() => {
								setSelectedExperience(null);
								setInputSheetOpen(true);
							}}
						>
							<div className="flex items-center gap-2 justify-center">
								<img src="/icons/plus-black.svg" alt="" className="w-6 h-6" />
								{
									content[
										"practicalExperience.addCustomPracticalExperienceButton.label"
									]
								}
							</div>
						</PrimaryThemedButton>
						<InputBottomSheet
							open={inputSheetOpen}
							onClose={() => {
								setInputSheetOpen(false);
								setSelectedExperience(null);
							}}
							sheetAriaLabel={
								content["practicalExperience.bottomSheet.input.ariaLabel"]
							}
							inputPlaceholder={
								selectedSuggestion?.inputPlaceholder ||
								content["practicalExperience.bottomSheet.input.addPlaceholder"]
							}
							onSubmit={(value) => {
								const suggestion = experienceSuggestions.find(
									(item) => item.value === selectedExperience,
								);
								setPendingDescription(value);
								setPendingSelectedExperienceId(selectedExperience);
								setPendingSelectedExperienceLabel(suggestion?.label ?? null);
								setInputSheetOpen(false);
								setSelectedExperience(null);
								setRatingSheetOpen(true);
							}}
							submitButtonLabel={
								content["practicalExperience.bottomSheet.nextButtonLabel"]
							}
							title={
								selectedExperience
									? selectedSuggestion?.heading
									: content["practicalExperience.bottomSheet.addOwn.title"]
							}
							isCancelButtonVisible={false}
						/>
						<RatingBottomSheet
							open={ratingSheetOpen}
							onClose={closeRatingSheet}
							ariaLabel={
								content["practicalExperience.bottomSheet.rating.ariaLabel"]
							}
							title={content["practicalExperience.bottomSheet.rating.title"]}
							onSubmit={(rating, tags) => {
								addPracticalExperience({
									description: pendingDescription,
									selectedExperienceId: pendingSelectedExperienceId,
									selectedExperienceLabel: pendingSelectedExperienceLabel,
									rating,
									tags,
								});
								closeRatingSheet();
							}}
						/>
					</>
				</div>
			</div>
		</StepLayout>
	);
}
