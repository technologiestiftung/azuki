import { content } from "../../../content/de";
import { useAppStore } from "../../../store/useAppStore";
import { Step } from "../../../common";
import { PrimaryButton } from "../../primitives/buttons/PrimaryButton";
import { BackButton } from "../../back-button/BackButton";

export function StartScreen() {
	const goToStep = useAppStore((state) => state.goToStep);
	const nextStep = useAppStore((state) => state.nextStep);

	return (
		<div className="flex flex-col h-[100dvh] p-4 overflow-y-auto min-h-0">
			<div className="pb-1">
				<BackButton onClick={() => goToStep(Step.Welcome)} />
			</div>

			<div className="flex-1 flex flex-col items-center justify-center">
				<img src="/illustrations/star.svg" alt="" className="w-full" />
			</div>

			<div className="flex flex-col gap-4 py-6">
				<h1 className="text-4xl font-bold">{content["start.title"]}</h1>
				<p className="text-lg font-normal">{content["start.description"]}</p>
			</div>

			<PrimaryButton onClick={nextStep} className="w-full mt-8">
				{content["start.cta"]}
			</PrimaryButton>
		</div>
	);
}
