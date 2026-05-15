import { useNavigate } from "react-router-dom";
import { content } from "../../content/de";
import { PrimaryThemedButton } from "../primitives/buttons/PrimaryThemedButton";
import { useAppStore } from "../../store/useAppStore";

export function BottomCard() {
	const navigate = useNavigate();
	const handleNewStart = () => {
		useAppStore.getState().resetProfile();
		navigate("/welcome");
	};

	return (
		<div className="flex flex-col gap-5 px-3 py-5 rounded-2xl border border-sky-100 bg-sky-50">
			<h3 className="text-2xl font-bold text-sky-1000 text-center">
				{content["results.bottomCard.title"]}
			</h3>
			<PrimaryThemedButton
				onClick={handleNewStart}
				ariaLabel={content["results.bottomCard.resetCta"]}
				title={content["results.bottomCard.resetCta"]}
				className="w-full"
			>
				{content["results.bottomCard.resetCta"]}
			</PrimaryThemedButton>
		</div>
	);
}
