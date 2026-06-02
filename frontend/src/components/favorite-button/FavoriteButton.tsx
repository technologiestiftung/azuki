import type { MouseEvent } from "react";
import { content } from "../../content";

interface FavoriteButtonProps {
	onClick: () => void;
	isFavorite: boolean;
}

export function FavoriteButton({ onClick, isFavorite }: FavoriteButtonProps) {
	const handleClick = (event: MouseEvent) => {
		event.stopPropagation();
		onClick();
	};

	return (
		<button
			type="button"
			className="absolute flex items-center justify-center z-10 w-10 h-10 -top-[9px] right-1"
			onClick={handleClick}
			aria-pressed={isFavorite}
			aria-label={
				isFavorite
					? content["results.favorite.remove"]
					: content["results.favorite.add"]
			}
		>
			<img
				src="/icons/favorite.svg"
				alt=""
				className={isFavorite ? "hidden" : "block w-7 h-7"}
			/>
			<img
				src="/icons/favorite-filled.svg"
				alt=""
				className={isFavorite ? "block  w-7 h-7" : "hidden"}
			/>
		</button>
	);
}
