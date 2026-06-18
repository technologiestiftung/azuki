import { useEffect, useState } from "react";
import { BottomSheet } from "../../../primitives/bottom-sheet/BottomSheet";
import { content } from "../../../../content";
import { StarRating } from "../../../competence-profile/star-rating/StarRating";
import { GhostIconButton } from "../../../primitives/buttons/GhostIconButton";

export function RatingBottomSheet({
	open,
	onClose,
	onBack,
	ariaLabel,
	title,
	onSubmit,
}: {
	open: boolean;
	onClose: () => void;
	onBack: () => void;
	ariaLabel: string;
	title: string;
	onSubmit: (rating: number) => void;
}) {
	const [selectedRating, setSelectedRating] = useState(0);

	useEffect(() => {
		if (open) {
			setSelectedRating(0);
		}
	}, [open]);

	function handleRatingChange(value: number) {
		setSelectedRating(value);
		onSubmit(value);
	}

	return (
		<BottomSheet open={open} onClose={onClose} ariaLabel={ariaLabel}>
			<div className="flex flex-col items-center pb-10 w-full">
				<div className="flex w-full px-2">
					<GhostIconButton
						className="w-12 h-12"
						onClick={onBack}
						ariaLabel={content["common.bottomSheet.backButtonAriaLabel"]}
						iconSrc="/icons/arrow-back-black.svg"
					/>
				</div>
				<div className="flex flex-col gap-4 w-full px-4">
					{title && (
						<h2 className="text-left self-start text-2xl font-semibold text-gray-900 pt-1 px-1">
							{title || content["practicalExperience.bottomSheet.rating.title"]}
						</h2>
					)}
					<div className="flex flex-col gap-2 w-full justify-center items-center">
						<StarRating
							rating={selectedRating}
							maxRating={5}
							onRatingChange={handleRatingChange}
						/>
					</div>
				</div>
			</div>
		</BottomSheet>
	);
}
