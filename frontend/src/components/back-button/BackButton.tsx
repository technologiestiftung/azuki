import React from "react";
import { content } from "../../content/de";

export const BackButton: React.FC<{
	onClick: () => void;
	disabled?: boolean;
}> = ({ onClick, disabled = false }) => {
	return (
		<button
			onClick={onClick}
			aria-label={content["navigation.back"]}
			disabled={disabled}
			className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
		>
			<img src="/icons/arrow-back-black.svg" alt="" className="w-6 h-6" />
		</button>
	);
};
