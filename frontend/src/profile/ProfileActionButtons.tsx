import { GhostIconButton } from "../components/primitives/buttons/GhostIconButton";
import { content } from "../content";
import { downloadProfile } from "./downloadProfile";
import { shareProfileLink } from "./shareProfileLink";

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
				onClick={() => {
					void downloadProfile();
				}}
				ariaLabel={content["profile.download.ariaLabel"]}
				title={content["profile.download"]}
				iconSize="w-5 h-5"
				className={buttonClassName}
			/>
			<GhostIconButton
				iconSrc="/icons/share.svg"
				onClick={() => {
					void shareProfileLink();
				}}
				ariaLabel={content["profile.share.ariaLabel"]}
				title={content["profile.share"]}
				iconSize="w-5 h-5"
				className={buttonClassName}
			/>
		</div>
	);
}
