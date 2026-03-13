import { content } from "../../../content/de";
import { useAppStore } from "../../../store/useAppStore";
import { Step } from "../../../common";
import { PrimaryThemedButton } from "../../primitives/buttons/PrimaryThemedButton";
import { BackButton } from "../../back-button/BackButton";

export function StartScreen() {
	const goToStep = useAppStore((state) => state.goToStep);
	const nextStep = useAppStore((state) => state.nextStep);

	return (
		<div className="flex flex-col h-[100dvh] pt-4 overflow-hidden min-h-0">
			<div className="pb-1 px-4">
				<BackButton onClick={() => goToStep(Step.Welcome)} />
			</div>

			<div className="flex-1 flex flex-col items-center justify-center px-4 min-h-0">
				<div className="flex-1 flex items-center justify-center w-full min-h-0">
					<img
						src="/illustrations/star.svg"
						alt=""
						className="max-h-full max-w-full object-contain"
					/>
				</div>
			</div>

			<div className="flex flex-col gap-4 py-6 mb-4 px-4">
				<h1 className="text-4xl font-bold">{content["start.title"]}</h1>
				<p className="text-lg font-normal">{content["start.description"]}</p>
			</div>

			<div className="w-full flex flex-col p-4 gap-y-2 max-w-[430px]">
				<PrimaryThemedButton onClick={nextStep} className="w-full">
					{content["start.cta"]}
				</PrimaryThemedButton>
			</div>
		</div>
	);
}
