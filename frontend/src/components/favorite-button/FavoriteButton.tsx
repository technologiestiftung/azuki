import type { MouseEvent } from "react";
import { content } from "../../content";

interface FavoriteButtonProps {
	onClick: () => void;
	isFavorite: boolean;
	className?: string;
	iconSize?: "small" | "medium";
}

export function FavoriteButton({
	onClick,
	isFavorite,
	className,
	iconSize = "small",
}: FavoriteButtonProps) {
	const handleClick = (event: MouseEvent) => {
		event.preventDefault();
		event.stopPropagation();
		onClick();
	};

	return (
		<button
			type="button"
			className={`flex items-center justify-center z-10 ${iconSize === "small" ? "w-6 h-6" : "w-7 h-7"} ${className} focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 rounded-sm`}
			onClick={handleClick}
			aria-pressed={isFavorite}
			aria-label={
				isFavorite
					? content["results.favorite.remove"]
					: content["results.favorite.add"]
			}
		>
			<img
				src="/icons/favorite-star.svg"
				alt=""
				className={
					isFavorite
						? "hidden"
						: `block ${iconSize === "small" ? "w-6 h-6" : "w-7 h-7"}`
				}
			/>
			<img
				src="/icons/favorite-star-filled.svg"
				alt=""
				className={
					isFavorite
						? `block ${iconSize === "small" ? "w-6 h-6" : "w-7 h-7"}`
						: "hidden"
				}
			/>
		</button>
	);
}
