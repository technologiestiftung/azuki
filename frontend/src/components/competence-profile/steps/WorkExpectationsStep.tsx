import { useState, useRef } from "react";
import { content } from "../../../content";
import { StepLayout } from "./StepLayout";
import { SelectableRowButton } from "../../primitives/buttons/SelectableRowButton";
import { useAppStore } from "../../../store/useAppStore";
import { useFlowNavigation } from "../../../routing/useFlowNavigation";
import { workExpectationOptions } from "./work-expectation-options";
import { PrimaryThemedButton } from "../../primitives/buttons/PrimaryThemedButton";
import { InputBottomSheet } from "../../input-bottom-sheet/InputBottomSheet";

export function WorkExpectationsStep() {
	const { goNext } = useFlowNavigation();
	const profile = useAppStore((state) => state.profile);
	const toggleWorkExpectation = useAppStore(
		(state) => state.toggleWorkExpectation,
	);

	const toggleCustomWorkExpectation = useAppStore(
		(state) => state.toggleCustomWorkExpectation,
	);
	const addCustomWorkExpectation = useAppStore(
		(state) => state.addCustomWorkExpectation,
	);
	const [inputSheetOpen, setInputSheetOpen] = useState(false);
	const customWorkExpectationsSectionRef = useRef<HTMLDivElement>(null);

	const handleAddCustomWorkExpectation = (value: string) => {
		const trimmedValue = value.trim();
		if (trimmedValue && !profile.workExpectations.includes(trimmedValue)) {
			addCustomWorkExpectation(trimmedValue);
		}
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				customWorkExpectationsSectionRef.current?.scrollIntoView({
					behavior: "smooth",
					block: "start",
				});
			});
		});
	};

	return (
		<StepLayout
			question={content["workExpectations.question"]}
			onNext={goNext}
			onSkip={goNext}
			skipLabel={content["workExpectations.skipButton.label"]}
			isSkipConfirmDialogOpen={profile.workExpectations.length === 0}
			skipConfirmTitleKey="skipConfirmDialog.multipleChoice.title"
			skipConfirmDescriptionKey="skipConfirmDialog.multipleChoice.description"
			subtitle={content["common.multiSelect.subline"]}
		>
			<div className="flex flex-col gap-3 pb-8">
				{profile.customWorkExpectations &&
					profile.customWorkExpectations.length > 0 && (
						<div ref={customWorkExpectationsSectionRef} className="scroll-mt-4">
							<h3 className="text-lg font-semibold text-gray-500 mb-2 px-3.5">
								{content["workExpectations.customWorkExpectation.label"]}
							</h3>
							<div className="flex flex-col gap-y-2 rounded-2xl">
								{profile.customWorkExpectations.map(
									(customExpectation: string) => (
										<SelectableRowButton
											key={customExpectation}
											label={customExpectation}
											selected={profile.customWorkExpectations.includes(
												customExpectation,
											)}
											onClick={() =>
												toggleCustomWorkExpectation(customExpectation)
											}
										/>
									),
								)}
								<PrimaryThemedButton
									className="text-lg mt-1.5 mb-5"
									onClick={() => setInputSheetOpen(true)}
								>
									<div className="flex items-center gap-2 justify-center">
										<img
											src="/icons/plus-black.svg"
											alt=""
											className="w-6 h-6"
										/>
										{
											content[
												"workExpectations.addCustomWorkExpectationButton.addMore"
											]
										}
									</div>
								</PrimaryThemedButton>
							</div>
						</div>
					)}
				{workExpectationOptions.map((value) => {
					const selected = profile.workExpectations.includes(value.value);
					return (
						<SelectableRowButton
							key={value.value}
							label={value.label}
							selected={selected}
							onClick={() => toggleWorkExpectation(value.value)}
						/>
					);
				})}
			</div>
			{profile.customWorkExpectations &&
				profile.customWorkExpectations.length === 0 && (
					<PrimaryThemedButton
						className="text-lg"
						ariaLabel={
							content[
								"workExpectations.addCustomWorkExpectationButton.ariaLabel"
							]
						}
						onClick={() => setInputSheetOpen(true)}
					>
						<div className="flex items-center gap-2 justify-center">
							<img src="/icons/plus-black.svg" alt="" className="w-6 h-6" />
							{content["workExpectations.addCustomWorkExpectationButton.label"]}
						</div>
					</PrimaryThemedButton>
				)}

			<InputBottomSheet
				open={inputSheetOpen}
				onClose={() => setInputSheetOpen(false)}
				sheetAriaLabel={
					content["workExpectations.bottomSheet.input.addPlaceholder"]
				}
				inputPlaceholder={
					content["workExpectations.bottomSheet.input.addPlaceholder"]
				}
				onSubmit={handleAddCustomWorkExpectation}
			/>
		</StepLayout>
	);
}
