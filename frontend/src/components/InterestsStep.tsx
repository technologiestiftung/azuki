import { useState } from "react";
import { content } from "../content/de";
import { useAppState, useAppDispatch } from "../context/AppContext";
import { Step } from "../types";
import { StepLayout } from "./StepLayout";

export function InterestsStep() {
	const { profile } = useAppState();
	const dispatch = useAppDispatch();
	const [customInput, setCustomInput] = useState("");

	function handleAddCustom() {
		const trimmed = customInput.trim();
		if (trimmed && !profile.interessen.includes(trimmed)) {
			dispatch({ type: "ADD_CUSTOM_INTEREST", interest: trimmed });
			setCustomInput("");
		}
	}

	return (
		<StepLayout
			question={content.interests.question}
			currentStep={Step.Interests}
			onNext={() => dispatch({ type: "NEXT_STEP" })}
			onSkip={() => dispatch({ type: "NEXT_STEP" })}
			nextDisabled={profile.interessen.length === 0}
		>
			<div className="space-y-6">
				{profile.customInteressen.length > 0 && (
					<div>
						<h3 className="text-caption font-semibold mb-2" style={{ color: "var(--theme-primary-filled)" }}>
							{content.interests.addedByYouLabel}
						</h3>
						<div className="flex flex-wrap gap-2">
							{profile.customInteressen.map((interest) => (
								<button
									key={interest}
									onClick={() => dispatch({ type: "TOGGLE_INTEREST", interest })}
									className="px-4 py-2 rounded-full border-2 text-body transition-colors"
									style={{
										borderColor: profile.interessen.includes(interest)
											? "var(--theme-primary-filled)"
											: "#e5e7eb",
										backgroundColor: profile.interessen.includes(interest)
											? "var(--theme-subtle)"
											: "transparent",
									}}
								>
									{interest}
								</button>
							))}
						</div>
					</div>
				)}

				{content.interests.categories.map((category) => (
					<div key={category.name}>
						<h3 className="text-caption font-semibold text-gray-500 mb-2">
							{category.name}
						</h3>
						<div className="flex flex-wrap gap-2">
							{category.items.map((item) => {
								const selected = profile.interessen.includes(item.label);
								return (
									<button
										key={item.label}
										onClick={() =>
											dispatch({
												type: "TOGGLE_INTEREST",
												interest: item.label,
											})
										}
										className="flex items-center gap-2 px-4 py-2 rounded-full border-2 text-body transition-colors"
										style={{
											borderColor: selected
												? "var(--theme-primary-filled)"
												: "#e5e7eb",
											backgroundColor: selected
												? "var(--theme-subtle)"
												: "transparent",
										}}
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

			<div className="flex items-center gap-2 mt-6 mb-2">
				<input
					type="text"
					value={customInput}
					onChange={(e) => setCustomInput(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
					placeholder={content.interests.addPlaceholder}
					className="flex-1 px-4 py-3 rounded-2xl border-2 border-gray-200 text-body bg-white focus:outline-none focus:border-sky-300"
				/>
				<button
					onClick={handleAddCustom}
					disabled={!customInput.trim()}
					className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
					style={{
						backgroundColor: customInput.trim()
							? "var(--theme-primary-filled)"
							: "var(--btn-fill-disabled)",
					}}
				>
					<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
						<path d="M10 4v12M4 10h12" stroke={customInput.trim() ? "#fff" : "#9ca3af"} strokeWidth="2" strokeLinecap="round" />
					</svg>
				</button>
			</div>
		</StepLayout>
	);
}
