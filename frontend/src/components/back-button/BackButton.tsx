import React from "react";
import { content } from "../../content";
import { GhostIconButton } from "../primitives/buttons/GhostIconButton";

export const BackButton: React.FC<{
	onClick: () => void;
	disabled?: boolean;
}> = ({ onClick, disabled = false }) => {
	return (
		<GhostIconButton
			onClick={onClick}
			ariaLabel={content["navigation.back"]}
			disabled={disabled}
		>
			<img src="/icons/arrow-back-black.svg" alt="" className="w-6 h-6" />
		</GhostIconButton>
	);
};
