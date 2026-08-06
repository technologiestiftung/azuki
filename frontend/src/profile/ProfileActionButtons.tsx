import type { CSSProperties } from "react";
import { SecondaryIconButton } from "../components/primitives/buttons/SecondaryIconButton";
import { content } from "../content";
import { downloadProfile } from "./downloadProfile";
import { shareProfileLink } from "./shareProfileLink";

interface ProfileActionButtonsProps {
	buttonClassName?: string;
	buttonStyle?: CSSProperties;
}

export function ProfileActionButtons({
	buttonClassName,
	buttonStyle,
}: ProfileActionButtonsProps) {
	return (
		<div className="flex items-center gap-1.5">
			<SecondaryIconButton
				iconSrc="/icons/download.svg"
				onClick={() => {
					void downloadProfile();
				}}
				ariaLabel={content["profile.download.ariaLabel"]}
				title={content["profile.download"]}
				className={buttonClassName}
				style={buttonStyle}
			/>
			<SecondaryIconButton
				iconSrc="/icons/share.svg"
				onClick={() => {
					void shareProfileLink();
				}}
				ariaLabel={content["profile.share.ariaLabel"]}
				title={content["profile.share"]}
				className={buttonClassName}
				style={buttonStyle}
			/>
		</div>
	);
}
