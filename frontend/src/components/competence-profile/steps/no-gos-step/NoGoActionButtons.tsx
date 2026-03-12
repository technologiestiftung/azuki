import { content } from "../../../../content/de";

export const NoGoActionButtons = ({
	onClickReject,
	onClickAccept,
}: {
	onClickReject: () => void;
	onClickAccept: () => void;
}) => {
	return (
		<div className="flex gap-3">
			<button
				className="py-2 px-5 min-h-14 rounded-2xl text-lg leading-6 font-medium text-orange-1000 flex items-center justify-center gap-2 flex-1 bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
				onClick={onClickReject}
				aria-label={content["noGos.ariaLabel.reject"]}
			>
				{content["noGos.rejectLabel"]}
				<img src="/icons/close-black.svg" alt="" className="w-6 h-6" />
			</button>
			<button
				className="py-2 px-5 min-h-14 rounded-2xl text-lg leading-6 font-medium text-orange-1000 flex items-center justify-center gap-2 flex-1 bg-sky-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
				onClick={onClickAccept}
				aria-label={content["noGos.ariaLabel.accept"]}
			>
				{content["noGos.acceptLabel"]}
				<img src="/icons/check-black.svg" alt="" className="w-6 h-6" />
			</button>
		</div>
	);
};
