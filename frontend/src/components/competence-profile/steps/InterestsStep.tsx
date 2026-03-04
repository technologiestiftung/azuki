import { useState } from "react";
import { content } from "../../../content/de";
import { useAppStore } from "../../../store/useAppStore";
import { Step } from "../../../common";
import { StepLayout } from "./StepLayout";

export function InterestsStep() {
	const profile = useAppStore((state) => state.profile);
	const toggleInterest = useAppStore((state) => state.toggleInterest);
	const addCustomInterest = useAppStore((state) => state.addCustomInterest);
	const nextStep = useAppStore((state) => state.nextStep);
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
			currentStep={Step.Interests}
			onNext={nextStep}
			onSkip={nextStep}
			nextDisabled={profile.interests.length === 0}
		>
			<div className="space-y-6">
				{profile.customInterests.length > 0 && (
					<div>
						<h3 className="text-sm font-semibold mb-2 text-sky-300">
							{content["interests.addedByYouLabel"]}
						</h3>
						<div className="flex flex-wrap gap-2">
							{profile.customInterests.map((interest) => (
								<button
									className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 text-base transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500	${
										profile.interests.includes(interest)
											? "border-sky-300 bg-sky-400/30"
											: "border-gray-200 bg-transparent"
									} `}
									key={interest}
									onClick={() => toggleInterest(interest)}
								>
									{interest}
								</button>
							))}
						</div>
					</div>
				)}

				{content["interests.categories"].map((category) => (
					<div key={category.name}>
						<h3 className="text-sm font-semibold text-gray-500 mb-2">
							{category.name}
						</h3>
						<div className="flex flex-wrap gap-2">
							{category.items.map((item) => {
								const selected = profile.interests.includes(item.label);
								return (
									<button
										key={item.label}
										onClick={() => toggleInterest(item.label)}
										className={`flex items-center gap-2 px-4 py-2 rounded-2xl border-2 text-base transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 ${
											selected
												? "border-sky-300 bg-sky-400/28"
												: "border-gray-200 bg-transparent"
										}`}
									>
										<span>{item.icon}</span>
										<span>{item.label}</span>
									</button>
								);
							})}
						</div>
					</div>
				))}
			</div>

			<div className="flex items-center gap-2 mt-6 mb-2 rounded-2xl border-2 border-gray-200 focus-within:border-sky-500 pr-2 pl-4 py-2 group transition-colors">
				<input
					type="text"
					name="customInterest"
					value={customInput}
					onChange={(e) => setCustomInput(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
					placeholder={content["interests.addPlaceholder"]}
					className="flex-1 text-base bg-white focus:outline-none rounded-2xl px-4 py-2"
				/>
				<button
					onClick={handleAddCustom}
					disabled={!customInput.trim()}
					className={`w-10 h-10 flex items-center justify-center transition-colors rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 ${
						customInput.trim() ? "bg-sky-300" : "bg-gray-200"
					}`}
				>
					<img src="/icons/arrow-up-white.svg" alt="" className="w-4 h-4" />
				</button>
			</div>
		</StepLayout>
	);
}
