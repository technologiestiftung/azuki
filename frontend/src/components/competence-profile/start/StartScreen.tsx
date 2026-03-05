import { content } from "../../../content/de";
import { useAppStore } from "../../../store/useAppStore";
import { Step } from "../../../common";
import { PrimaryButton } from "../../primitives/buttons/PrimaryButton";
import { BackButton } from "../../back-button/BackButton";

export function StartScreen() {
	const goToStep = useAppStore((state) => state.goToStep);
	const nextStep = useAppStore((state) => state.nextStep);

	return (
		<div className="flex flex-col h-[100dvh] pt-4 overflow-y-auto min-h-0">
			<div className="pb-1 px-4">
				<BackButton onClick={() => goToStep(Step.Welcome)} />
			</div>

			<div className="flex-1 flex flex-col items-center justify-center px-4">
				<img src="/illustrations/star.svg" alt="" className="w-full" />
			</div>

			<div className="flex flex-col gap-4 py-6 mb-4 px-4">
				<h1 className="text-4xl font-bold">{content["start.title"]}</h1>
				<p className="text-lg font-normal">{content["start.description"]}</p>
			</div>

			<div className="w-full bg-white border-t-2 border-gray-200 flex flex-col p-4 gap-y-2 max-w-[430px]">
				<PrimaryButton onClick={nextStep} className="w-full">
					{content["start.cta"]}
				</PrimaryButton>
			</div>
		</div>
	);
}
