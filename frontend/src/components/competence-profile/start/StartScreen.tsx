import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { content } from "../../../content";
import { PrimaryThemedButton } from "../../primitives/buttons/PrimaryThemedButton";
import { useFlowNavigation } from "../../../routing/useFlowNavigation";
import { shouldPrefillProfile } from "../../../profile/prefillConfig";
import { GhostButton } from "../../primitives/buttons/GhostButton";

export function StartScreen() {
	const navigate = useNavigate();
	const { goNext } = useFlowNavigation();
	const [isFirstStep, setIsFirstStep] = useState(true);
	const [animationKey, setAnimationKey] = useState(0);

	const handleNext = () => {
		if (isFirstStep) {
			setIsFirstStep(false);
			setAnimationKey((k) => k + 1);
		} else {
			goNext();
		}
	};

	return (
		<div className="flex flex-col h-[100dvh] pt-4 overflow-hidden min-h-0 bg-sky-100">
			<div className="flex-1 flex flex-col items-center justify-center px-4 min-h-0">
				<div
					key={`illustration-${animationKey}`}
					className={`flex-1 flex justify-center w-full min-h-0 ${isFirstStep ? "items-end" : "items-center"}`}
				>
					{isFirstStep ? (
						<img
							src="/illustrations/welcome-star.svg"
							alt=""
							className="max-h-full max-w-full object-contain"
						/>
					) : (
						<img
							src="/illustrations/clipboard.svg"
							alt=""
							className="max-h-full max-w-full object-contain"
						/>
					)}
				</div>
			</div>

			<div
				key={`card-${animationKey}`}
				className="flex flex-col gap-3 pt-6 bg-sky-white rounded-t-4xl animate-slideInBottom [animation-duration:0.5s]"
			>
				<div className="flex flex-col gap-3 px-5 text-sky-900">
					<h1 className="text-4xl font-extrabold text-center">
						{isFirstStep
							? content["start.step1.title"]
							: content["start.step2.title"]}
					</h1>

					<p
						className={`text-xl font-normal text-center px-4 {isFirstStep ? "hidden" : ""}`}
					>
						{content["start.step2.description"]}
					</p>
				</div>
				<div className="flex justify-center items-end px-2 w-full h-6">
					<div className="h-[5px] flex gap-1.5 items-center justify-center w-full rounded-full overflow-hidden">
						<div
							className={`h-full rounded-full transition-all duration-500 ease-out ${isFirstStep ? "w-6 bg-sky-300" : "w-3 bg-gray-200"}`}
						/>
						<div
							className={`h-full rounded-full transition-all duration-500 ease-out ${isFirstStep ? "w-3 bg-gray-200" : "w-6 bg-sky-300"}`}
						/>
					</div>
				</div>

				<div className="w-full flex flex-col px-4 pb-4 pt-1 gap-y-2 max-w-[430px]">
					<PrimaryThemedButton onClick={handleNext} className="w-full">
						{isFirstStep
							? content["start.step1.cta.label"]
							: content["start.step2.cta.label"]}
					</PrimaryThemedButton>
					{shouldPrefillProfile && (
						<GhostButton
							onClick={() => navigate("/loading")}
							className="w-full"
						>
							{content["start.cta.prefill"]}
						</GhostButton>
					)}
				</div>
			</div>
		</div>
	);
}
