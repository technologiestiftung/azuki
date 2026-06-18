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
			label: "Zu Hause",
			value: "home-help",
			heading: content["practicalExperience.bottomSheet.addHomeHelp.title"],
			inputPlaceholder:
				content["practicalExperience.bottomSheet.input.homeHelp.placeholder"],
			examples: [
				content["practicalExperience.bottomSheet.example.homeHelp.li1"],
				content["practicalExperience.bottomSheet.example.homeHelp.li2"],
				content["practicalExperience.bottomSheet.example.homeHelp.li3"],
			],
		},
		{
			label: "Schule",
			value: "school",
			heading: content["practicalExperience.bottomSheet.school.title"],
			inputPlaceholder:
				content["practicalExperience.bottomSheet.input.school.placeholder"],
			examples: [
				content["practicalExperience.bottomSheet.example.school.li1"],
				content["practicalExperience.bottomSheet.example.school.li2"],
				content["practicalExperience.bottomSheet.example.school.li3"],
			],
		},
		{
			label: "Im Freundeskreis",
			value: "friends",
			heading: content["practicalExperience.bottomSheet.friends.title"],
			inputPlaceholder:
				content["practicalExperience.bottomSheet.input.friends.placeholder"],
			examples: [
				content["practicalExperience.bottomSheet.example.friends.li1"],
				content["practicalExperience.bottomSheet.example.friends.li2"],
				content["practicalExperience.bottomSheet.example.friends.li3"],
			],
		},
		{
			label: "Verein",
			value: "club",
			heading: content["practicalExperience.bottomSheet.addClub.title"],
			inputPlaceholder:
				content["practicalExperience.bottomSheet.input.club.placeholder"],
			examples: [
				content["practicalExperience.bottomSheet.example.club.li1"],
				content["practicalExperience.bottomSheet.example.club.li2"],
				content["practicalExperience.bottomSheet.example.club.li3"],
			],
		},
		{
			label: "Praktikum",
			value: "internship",
			heading: content["practicalExperience.bottomSheet.addInternship.title"],
			inputPlaceholder:
				content["practicalExperience.bottomSheet.input.internship.placeholder"],
			examples: [
				content["practicalExperience.bottomSheet.example.internship.li1"],
				content["practicalExperience.bottomSheet.example.internship.li2"],
			],
		},
		{
			label: "Job",
			value: "job",
			heading: content["practicalExperience.bottomSheet.addJob.title"],
			inputPlaceholder:
				content["practicalExperience.bottomSheet.input.job.placeholder"],
			examples: [
				content["practicalExperience.bottomSheet.example.job.li1"],
				content["practicalExperience.bottomSheet.example.job.li2"],
			],
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
											<div className="flex gap-1.5 items-center justify-center">
												{entry.description}{" "}
												<span className="flex items-center text-sm text-sky-300">
													{entry.rating}
													<img
														src="/icons/theme-colored-star.svg"
														alt=""
														className="w-3 h-3"
													/>
												</span>
											</div>
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
											src="/icons/plus-gray.svg"
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
								content[
									"practicalExperience.bottomSheet.input.addOwn.placeholder"
								]
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
							description={
								<div>
									{selectedSuggestion?.examples?.length &&
										selectedSuggestion.examples.length > 0 &&
										content["practicalExperience.bottomSheet.example.label"]}
									{selectedSuggestion?.examples.map((example) => (
										<ul className="list-disc list-inside" key={example}>
											<li key={example}>{example}</li>
										</ul>
									))}
								</div>
							}
							isCancelButtonVisible={false}
						/>
						<RatingBottomSheet
							open={ratingSheetOpen}
							onClose={closeRatingSheet}
							onBack={() => {
								setRatingSheetOpen(false);
								setInputSheetOpen(true);
							}}
							ariaLabel={
								content["practicalExperience.bottomSheet.rating.ariaLabel"]
							}
							title={content["practicalExperience.bottomSheet.rating.title"]}
							onSubmit={(rating) => {
								addPracticalExperience({
									description: pendingDescription,
									selectedExperienceId: pendingSelectedExperienceId,
									selectedExperienceLabel: pendingSelectedExperienceLabel,
									rating,
								});
								setTimeout(() => {
									closeRatingSheet();
								}, 500);
							}}
						/>
					</>
				</div>
			</div>
		</StepLayout>
	);
}
