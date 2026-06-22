import React, { useEffect, useRef, useState } from "react";
import { content } from "../../../content";

interface StarRatingProps {
	rating: number;
	maxRating: number;
	onRatingChange?: (rating: number) => void;
}

function starAriaLabel(value: number, max: number): string {
	return content["starRating.starAriaLabel"]
		.replace("{value}", String(value))
		.replace("{max}", String(max));
}

export const StarRating: React.FC<StarRatingProps> = ({
	rating,
	maxRating,
	onRatingChange,
}) => {
	const [committedRating, setCommittedRating] = useState(rating);
	const [focusedIndex, setFocusedIndex] = useState(rating > 0 ? rating - 1 : 0);
	const [previewRating, setPreviewRating] = useState(0);
	const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

	useEffect(() => {
		setCommittedRating(rating);
		setFocusedIndex(rating > 0 ? rating - 1 : 0);
		setPreviewRating(0);
	}, [rating]);

	const displayRating = previewRating > 0 ? previewRating : committedRating;

	function commitRating(value: number) {
		setCommittedRating(value);
		setPreviewRating(0);
		setFocusedIndex(value - 1);
		onRatingChange?.(value);
	}

	function focusStar(index: number) {
		buttonRefs.current[index]?.focus();
	}

	function previewStar(index: number) {
		setFocusedIndex(index);
		setPreviewRating(index + 1);
		focusStar(index);
	}

	function handleGroupBlur(event: React.FocusEvent<HTMLDivElement>) {
		if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
			setPreviewRating(0);
		}
	}

	function handleKeyDown(
		event: React.KeyboardEvent<HTMLButtonElement>,
		index: number,
	) {
		let nextIndex: number | null = null;

		switch (event.key) {
			case "ArrowRight":
			case "ArrowUp":
				nextIndex = index < maxRating - 1 ? index + 1 : 0;
				break;
			case "ArrowLeft":
			case "ArrowDown":
				nextIndex = index > 0 ? index - 1 : maxRating - 1;
				break;
			case "Home":
				nextIndex = 0;
				break;
			case "End":
				nextIndex = maxRating - 1;
				break;
			case " ":
			case "Enter":
				event.preventDefault();
				commitRating(previewRating > 0 ? previewRating : index + 1);
				return;
			default:
				return;
		}

		event.preventDefault();
		previewStar(nextIndex);
	}

	return (
		<div
			role="radiogroup"
			aria-label={content["starRating.groupAriaLabel"]}
			className="flex items-center gap-4"
			onBlur={handleGroupBlur}
		>
			{Array.from({ length: maxRating }).map((_, index) => {
				const starValue = index + 1;
				const isSelected = committedRating === starValue;

				return (
					<button
						key={starValue}
						ref={(element) => {
							buttonRefs.current[index] = element;
						}}
						type="button"
						role="radio"
						aria-checked={isSelected}
						aria-label={starAriaLabel(starValue, maxRating)}
						tabIndex={index === focusedIndex ? 0 : -1}
						className="rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
						onClick={() => commitRating(starValue)}
						onFocus={() => setFocusedIndex(index)}
						onKeyDown={(event) => handleKeyDown(event, index)}
					>
						<img
							src="/icons/star.svg"
							alt=""
							aria-hidden
							className={displayRating >= starValue ? "hidden" : "block"}
						/>
						<img
							src="/icons/star-filled.svg"
							alt=""
							aria-hidden
							className={displayRating >= starValue ? "block" : "hidden"}
						/>
					</button>
				);
			})}
		</div>
	);
};
