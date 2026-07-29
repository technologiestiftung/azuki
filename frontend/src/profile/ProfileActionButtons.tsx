import { GhostIconButton } from "../components/primitives/buttons/GhostIconButton";
import { content } from "../content";

interface ProfileActionButtonsProps {
	buttonClassName?: string;
}

export function ProfileActionButtons({
	buttonClassName,
}: ProfileActionButtonsProps) {
	return (
		<div className="flex items-center gap-1.5">
			<GhostIconButton
				iconSrc="/icons/download.svg"
				onClick={() => {}}
				ariaLabel={content["results.download.ariaLabel"]}
				title={content["results.download"]}
				iconSize="w-5 h-5"
				className={buttonClassName}
			/>
			<GhostIconButton
				iconSrc="/icons/share.svg"
				onClick={() => {}}
				ariaLabel={content["results.share.ariaLabel"]}
				title={content["results.share"]}
				iconSize="w-5 h-5"
				className={buttonClassName}
			/>
		</div>
	);
}
