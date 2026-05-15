import type { MouseEvent } from "react";
import { content } from "../../content/de";

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
			className="absolute top-3 right-3 z-10 w-6 h-6"
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
				alt="Favorite"
				className={isFavorite ? "hidden" : "block"}
			/>
			<img
				src="/icons/favorite-filled.svg"
				alt="Favorite"
				className={isFavorite ? "block" : "hidden"}
			/>
		</button>
	);
}
