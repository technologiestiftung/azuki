import { useState, useRef } from "react";
import { content } from "../../../../content";
import { useAppStore } from "../../../../store/useAppStore";
import { StepLayout } from "../StepLayout";
import { useFlowNavigation } from "../../../../routing/useFlowNavigation";
import { interests } from "./interests";
import { Pill } from "../../../primitives/buttons/Pill";
import { PrimaryThemedButton } from "../../../primitives/buttons/PrimaryThemedButton";
import { InputBottomSheet } from "../../../input-bottom-sheet/InputBottomSheet";
import { SecondaryButton } from "../../../primitives/buttons/SecondaryButton";

export function InterestsStep() {
	const profile = useAppStore((state) => state.profile);
	const toggleInterest = useAppStore((state) => state.toggleInterest);
	const addCustomInterest = useAppStore((state) => state.addCustomInterest);
	const { goNext } = useFlowNavigation();
	const [inputSheetOpen, setInputSheetOpen] = useState(false);
	const customInterestsSectionRef = useRef<HTMLDivElement>(null);

	const handleAddCustomInterest = (value: string) => {
		const trimmedValue = value.trim();
		if (trimmedValue && !profile.interests.includes(trimmedValue)) {
			addCustomInterest(trimmedValue);
		}
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				customInterestsSectionRef.current?.scrollIntoView({
					behavior: "smooth",
					block: "start",
				});
			});
		});
	};

	return (
		<StepLayout
			question={content["interests.question"]}
			onNext={goNext}
			onSkip={goNext}
			subtitle={content["common.multiSelect.subline"]}
		>
			<div className="flex flex-col gap-8">
				{profile.customInterests && profile.customInterests.length === 0 && (
					<SecondaryButton
						className="text-lg"
						ariaLabel={content["interests.addCustomInterestsButton.ariaLabel"]}
						onClick={() => setInputSheetOpen(true)}
					>
						<div className="flex items-center gap-2 justify-center">
							<img src="/icons/plus-black.svg" alt="" className="w-6 h-6" />
							{content["interests.addCustomInterestsButton.label"]}
						</div>
					</SecondaryButton>
				)}
				{profile.customInterests.length > 0 && (
					<div ref={customInterestsSectionRef} className="scroll-mt-4">
						<h3 className="text-lg font-semibold text-gray-500 mb-2 px-3.5">
							{content["interests.addedByYouLabel"]}
						</h3>
						<div className="flex min-w-0 flex-wrap gap-x-2 gap-y-2.5 rounded-2xl bg-card-fill p-3">
							{profile.customInterests.map((interest: string) => (
								<Pill
									key={interest}
									label={interest}
									selected={profile.interests.includes(interest)}
									onClick={() => toggleInterest(interest)}
									ariaLabel={`${interest} ${content["interests.skipButton.pill.label.postfix"]}`}
								/>
							))}
							<PrimaryThemedButton
								className="text-lg mt-2"
								onClick={() => setInputSheetOpen(true)}
							>
								<div className="flex items-center gap-2 justify-center">
									<img src="/icons/plus-black.svg" alt="" className="w-6 h-6" />
									{content["interests.addCustomInterestsButton.addMore"]}
								</div>
							</PrimaryThemedButton>
						</div>
					</div>
				)}

				{interests.map((category) => (
					<div key={category.name}>
						<h3 className="text-lg font-semibold text-gray-500 mb-2 px-3.5">
							{category.name}
						</h3>
						<div className="flex min-w-0 flex-wrap gap-x-2 gap-y-2.5 rounded-2xl bg-card-fill p-3">
							{category.interests.map((item) => (
								<Pill
									key={item.label}
									label={item.label}
									icon={item.icon}
									selected={profile.interests.includes(item.value)}
									onClick={() => toggleInterest(item.value)}
									ariaLabel={`${item.label} ${content["interests.skipButton.pill.label.postfix"]}`}
								/>
							))}
						</div>
					</div>
				))}
			</div>

			<InputBottomSheet
				open={inputSheetOpen}
				onClose={() => setInputSheetOpen(false)}
				sheetAriaLabel={content["interests.bottomSheet.sheetAriaLabel"]}
				inputPlaceholder={content["interests.bottomSheet.input.addPlaceholder"]}
				errorMessage={content["interests.bottomSheet.errorMessage"]}
				onSubmit={handleAddCustomInterest}
			/>
		</StepLayout>
	);
}
