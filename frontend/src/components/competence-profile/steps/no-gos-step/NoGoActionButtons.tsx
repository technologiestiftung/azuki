import { content } from "../../../../content/de";
import { PrimaryOrangeButton } from "../../../primitives/buttons/PrimaryOrangeButton";
import { PrimaryThemedButton } from "../../../primitives/buttons/PrimaryThemedButton";

export const NoGoActionButtons = ({
	onClickReject,
	onClickAccept,
}: {
	onClickReject: () => void;
	onClickAccept: () => void;
}) => {
	return (
		<div className="flex gap-3">
			<PrimaryOrangeButton
				onClick={onClickReject}
				ariaLabel={content["noGos.ariaLabel.reject"]}
				className="flex gap-2 justify-center items-center flex-1"
			>
				<img src="/icons/close-black.svg" alt="" className="w-6 h-6" />
				{content["noGos.rejectLabel"]}
			</PrimaryOrangeButton>
			<PrimaryThemedButton
				onClick={onClickAccept}
				ariaLabel={content["noGos.ariaLabel.accept"]}
				className="flex gap-2 justify-center items-center flex-1"
			>
				<img src="/icons/check-black.svg" alt="" className="w-6 h-6" />
				{content["noGos.acceptLabel"]}
			</PrimaryThemedButton>
		</div>
	);
};
