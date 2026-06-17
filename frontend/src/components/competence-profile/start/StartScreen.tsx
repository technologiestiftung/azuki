import { useNavigate } from "react-router-dom";
import { content } from "../../../content";
import { PrimaryThemedButton } from "../../primitives/buttons/PrimaryThemedButton";
import { BackButton } from "../../back-button/BackButton";
import { useFlowNavigation } from "../../../routing/useFlowNavigation";
import { shouldPrefillProfile } from "../../../profile/prefillConfig";
import { GhostButton } from "../../primitives/buttons/GhostButton";

export function StartScreen() {
	const navigate = useNavigate();
	const { goNext } = useFlowNavigation();

	return (
		<div className="flex flex-col h-[100dvh] pt-4 overflow-hidden min-h-0">
			<div className="pb-1 px-4">
				<BackButton onClick={() => navigate("/welcome")} />
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
				<PrimaryThemedButton onClick={goNext} className="w-full">
					{content["start.cta"]}
				</PrimaryThemedButton>
				{shouldPrefillProfile && (
					<GhostButton onClick={() => navigate("/loading")} className="w-full">
						{content["start.cta.prefill"]}
					</GhostButton>
				)}
			</div>
		</div>
	);
}
