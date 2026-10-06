import { BottomSheet } from "../../primitives/bottom-sheet/BottomSheet";
import { GhostIconButton } from "../../primitives/buttons/GhostIconButton";
import { content } from "../../../content";

export interface InfoBottomSheetSource {
	label: string;
	href: string;
}

export interface InfoBottomSheetProps {
	open: boolean;
	onClose: () => void;
	title: string;
	description: string;
	ariaLabel?: string;
	source?: InfoBottomSheetSource;
}

export function InfoBottomSheet({
	open,
	onClose,
	title,
	description,
	ariaLabel,
	source,
}: InfoBottomSheetProps) {
	return (
		<BottomSheet open={open} onClose={onClose} ariaLabel={ariaLabel ?? title}>
			<div className="flex flex-col">
				<div className="flex w-full justify-end px-2">
					<GhostIconButton
						onClick={onClose}
						ariaLabel={content["common.bottomSheet.backButtonAriaLabel"]}
						iconSrc="/icons/close-black.svg"
					/>
				</div>
				<div className="flex flex-col gap-1 px-4 pb-5">
					<h2 className="text-xl font-semibold text-sky-900">{title}</h2>
					<p className="text-lg text-sky-900">{description}</p>
					{source && (
						<div className="pt-2">
							<span className="text-lg text-sky-shade-130">
								{content["common.infoSheet.sourceTitle"]}{" "}
								<a
									href={source.href}
									target="_blank"
									rel="noopener noreferrer"
									className="underline underline-offset-2"
								>
									{source.label}
								</a>
							</span>
						</div>
					)}
				</div>
			</div>
		</BottomSheet>
	);
}
