import { useNavigate } from "react-router-dom";
import { content } from "../../content";
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
			<h3 className="text-2xl font-semibold text-sky-1000 text-center">
				{content["results.bottomCard.title"]}
			</h3>
			<div className="flex flex-col">
				<PrimaryThemedButton
					onClick={handleNewStart}
					ariaLabel={content["results.bottomCard.resetCta"]}
					title={content["results.bottomCard.resetCta"]}
					className="w-full"
				>
					{content["results.bottomCard.resetCta"]}
				</PrimaryThemedButton>
				<a
					href={content["results.bottomCard.consultationLink"]}
					target="_blank"
					rel="noopener noreferrer"
					className="h-12 w-full flex items-center justify-center py-2 px-5 text-base font-medium transition-colors rounded-2xl 
				focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 
				md:hover:bg-gray-200 md:hover:text-gray-800 active:bg-gray-200 active:text-gray-800 text-gray-900 hover:text-gray-700 text-center"
				>
					{content["results.bottomCard.consultationCta"]}
				</a>
			</div>
		</div>
	);
}
