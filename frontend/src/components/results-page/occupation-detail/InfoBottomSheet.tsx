import { BottomSheet } from "../../primitives/bottom-sheet/BottomSheet";
import { GhostIconButton } from "../../primitives/buttons/GhostIconButton";
import { content } from "../../../content";

export interface InfoBottomSheetProps {
	open: boolean;
	onClose: () => void;
	title: string;
	description: string;
	ariaLabel?: string;
}

export function InfoBottomSheet({
	open,
	onClose,
	title,
	description,
	ariaLabel,
}: InfoBottomSheetProps) {
	return (
		<BottomSheet open={open} onClose={onClose} ariaLabel={ariaLabel ?? title}>
			<div className="flex flex-col gap-4">
				<div className="flex w-full justify-end pb-3.5 px-2">
					<GhostIconButton
						onClick={onClose}
						ariaLabel={content["common.bottomSheet.backButtonAriaLabel"]}
						iconSrc="/icons/close-black.svg"
					/>
				</div>
				<div className="flex flex-col gap-1 px-4 pb-5">
					<h2 className="text-xl font-semibold text-gray-900">{title}</h2>
					<p className="text-lg text-gray-700">{description}</p>
				</div>
			</div>
		</BottomSheet>
	);
}
