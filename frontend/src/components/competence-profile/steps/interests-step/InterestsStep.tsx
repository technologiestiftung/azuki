import { useState } from "react";
import { content } from "../../../../content/de";
import { useAppStore } from "../../../../store/useAppStore";
import { StepLayout } from "../StepLayout";
import { useFlowNavigation } from "../../../../routing/useFlowNavigation";
import { interests } from "./interests";
import { TextInput } from "../../../primitives/text-inputs/TextInput";
import { Pill } from "../../../primitives/buttons/Pill";

export function InterestsStep() {
	const profile = useAppStore((state) => state.profile);
	const toggleInterest = useAppStore((state) => state.toggleInterest);
	const addCustomInterest = useAppStore((state) => state.addCustomInterest);
	const { goNext } = useFlowNavigation();
	const [customInput, setCustomInput] = useState("");

	function handleAddCustom() {
		const trimmed = customInput.trim();
		if (trimmed && !profile.interests.includes(trimmed)) {
			addCustomInterest(trimmed);
			setCustomInput("");
		}
	}

	return (
		<StepLayout
			question={content["interests.question"]}
			onNext={goNext}
			nextDisabled={profile.interests.length === 0}
			bottomContent={
				<TextInput
					name="customInterest"
					value={customInput}
					onChange={(e) => setCustomInput(e.target.value)}
					onSubmit={handleAddCustom}
					submitDisabled={!customInput.trim()}
					placeholder={content["interests.addPlaceholder"]}
					containerClassName="mb-1"
				/>
			}
		>
			<div className="flex flex-col gap-8 pb-4">
				{profile.customInterests.length > 0 && (
					<div>
						<h3 className="text-lg font-semibold text-gray-500 mb-2 px-3.5">
							{content["interests.addedByYouLabel"]}
						</h3>
						<div className="flex flex-wrap gap-x-2 gap-y-2.5 rounded-2xl bg-card-fill p-3">
							{profile.customInterests.map((interest: string) => (
								<Pill
									key={interest}
									label={interest}
									selected={profile.interests.includes(interest)}
									onClick={() => toggleInterest(interest)}
									ariaLabel={`${interest} ${content["interests.skipButton.pill.label.postfix"]}`}
								/>
							))}
						</div>
					</div>
				)}

				{interests.map((category) => (
					<div key={category.name}>
						<h3 className="text-lg font-semibold text-gray-500 mb-2 px-3.5">
							{category.name}
						</h3>
						<div className="flex flex-wrap gap-x-2 gap-y-2.5 rounded-2xl bg-card-fill p-3">
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
		</StepLayout>
	);
}
