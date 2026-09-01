import { useState } from "react";
import { StepLayout } from "./StepLayout";
import { content } from "../../../content/index";
import { useFlowNavigation } from "../../../routing/useFlowNavigation";
import { InputBottomSheet } from "../../input-bottom-sheet/InputBottomSheet";
import { PrimaryThemedButton } from "../../primitives/buttons/PrimaryThemedButton";
import { isDuplicatePreferredJob } from "../../../profile/preferredJobUtils";
import { useAppStore } from "../../../store/useAppStore";
import { Pill } from "../../primitives/buttons/Pill";

export const PreferredJobsStep = () => {
	const { goNext } = useFlowNavigation();
	const [inputSheetOpen, setInputSheetOpen] = useState(false);
	const addPreferredJobs = useAppStore((state) => state.addPreferredJobs);
	const removePreferredJob = useAppStore((state) => state.removePreferredJob);
	const profile = useAppStore((state) => state.profile);

	const handleAddPreferredJobs = (value: string) => {
		const trimmedValue = value.trim();
		if (
			trimmedValue &&
			!isDuplicatePreferredJob(profile.preferredJobs, trimmedValue)
		) {
			addPreferredJobs([trimmedValue]);
		}
	};

	const AddPreferredJobButton = () => {
		return (
			<PrimaryThemedButton
				className="text-lg mt-2"
				onClick={() => setInputSheetOpen(true)}
			>
				<div className="flex items-center gap-2 justify-center">
					<img src="/icons/plus-black.svg" alt="" className="w-6 h-6" />
					{content["preferredJob.addButton.label"]}
				</div>
			</PrimaryThemedButton>
		);
	};

	return (
		<StepLayout
			question={content["preferredJob.question"]}
			onNext={goNext}
			onSkip={goNext}
			subtitle={content["preferredJob.subtitle"]}
			hasSkipButton={true}
		>
			{profile.preferredJobs.length > 0 ? (
				<div className="scroll-mt-4">
					<h3 className="text-lg font-semibold text-gray-500 mb-2 px-3.5">
						{content["preferredJob.addedByYouLabel"]}
					</h3>
					<div className="flex min-w-0 flex-wrap gap-x-2 gap-y-2.5 rounded-2xl bg-card-fill p-3">
						{profile.preferredJobs.map((preferredJob: string) => (
							<Pill
								key={preferredJob}
								label={preferredJob}
								selected={profile.preferredJobs.includes(preferredJob)}
								onClick={() => removePreferredJob(preferredJob)}
								ariaLabel={`${preferredJob} ${content["preferredJob.skipButton.pill.label.postfix"]}`}
								removeButton
							/>
						))}
						<AddPreferredJobButton />
					</div>
				</div>
			) : (
				<div className="flex flex-col gap-2 px-6 pt-5 pb-6 bg-gray-200 rounded-3xl">
					<div className="w-full flex justify-center pb-2">
						<img
							src="/illustrations/preferred-job.svg"
							alt="Preferred Job"
							className="w-full h-full object-contain"
						/>
					</div>
					<AddPreferredJobButton />
				</div>
			)}
			<InputBottomSheet
				open={inputSheetOpen}
				onClose={() => setInputSheetOpen(false)}
				title={content["preferredJob.bottomSheet.title"]}
				description={
					<div>
						{content["preferredJob.bottomSheet.example.label"]}
						<ul className="list-disc list-inside pl-2">
							<li>{content["preferredJob.bottomSheet.example.li1"]}</li>
							<li>{content["preferredJob.bottomSheet.example.li2"]}</li>
							<li>{content["preferredJob.bottomSheet.example.li3"]}</li>
						</ul>
					</div>
				}
				sheetAriaLabel={content["preferredJob.bottomSheet.sheetAriaLabel"]}
				inputPlaceholder={
					content["preferredJob.bottomSheet.input.addPlaceholder"]
				}
				errorMessage={content["preferredJob.bottomSheet.errorMessage"]}
				onSubmit={handleAddPreferredJobs}
			/>
		</StepLayout>
	);
};

export default PreferredJobsStep;
