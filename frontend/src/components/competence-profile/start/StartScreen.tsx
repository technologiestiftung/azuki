import { content } from "../../../content/de";
import { useAppStore } from "../../../store/useAppStore";
import { Step } from "../../../common";
import { PrimaryButton } from "../../primitives/buttons/PrimaryButton";
import { BackButton } from "../../back-button/BackButton";

export function StartScreen() {
	const goToStep = useAppStore((state) => state.goToStep);
	const nextStep = useAppStore((state) => state.nextStep);

	return (
		<div className="flex flex-col min-h-[100dvh]">
			<div className="px-4 pt-2 pb-1">
				<BackButton onClick={() => goToStep(Step.Welcome)} />
			</div>

			<div className="flex-1 flex flex-col items-center justify-center px-8">
				<img
					src="/illustrations/star.svg"
					alt=""
					className="w-64 h-64 object-contain mb-8"
				/>
			</div>

			<div className="px-4 pb-4">
				<h1 className="text-3xl font-bold mb-3">{content["start.title"]}</h1>
				<p className="text-base text-gray-600 mb-8">
					{content["start.description"]}
				</p>
			</div>

			<div className="px-4 pb-8">
				<PrimaryButton onClick={nextStep} className="w-full">
					{content["start.cta"]}
				</PrimaryButton>
			</div>
		</div>
	);
}
