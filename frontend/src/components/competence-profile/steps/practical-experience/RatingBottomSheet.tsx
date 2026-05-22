import { useEffect, useState } from "react";
import { BottomSheet } from "../../../primitives/bottom-sheet/BottomSheet";
import { content } from "../../../../content";
import { StarRating } from "../../../competence-profile/star-rating/StarRating";
import { GhostIconButton } from "../../../primitives/buttons/GhostIconButton";
import { Pill } from "../../../primitives/buttons/Pill";
import { PrimaryThemedButton } from "../../../primitives/buttons/PrimaryThemedButton";

export function RatingBottomSheet({
	open,
	onClose,
	ariaLabel,
	title,
	onSubmit,
}: {
	open: boolean;
	onClose: () => void;
	ariaLabel: string;
	title: string;
	onSubmit: (rating: number, tags: string[]) => void;
}) {
	const [isRated, setIsRated] = useState(false);
	const [selectedRating, setSelectedRating] = useState(0);
	const [selectedTags, setSelectedTags] = useState<string[]>([]);

	useEffect(() => {
		if (!open) {
			setIsRated(false);
			setSelectedRating(0);
			setSelectedTags([]);
		}
	}, [open]);

	const ratingIsBad = selectedRating === 1 || selectedRating === 2;
	const ratingIsMedium = selectedRating === 3;
	const ratingIsGood = selectedRating === 4 || selectedRating === 5;
	const tags = {
		ratingIsBad: [
			content["practicalExperience.bottomSheet.rating.bad.tag.stressful"],
			content["practicalExperience.bottomSheet.rating.bad.tag.difficult"],
			content["practicalExperience.bottomSheet.rating.bad.tag.pressure"],
			content["practicalExperience.bottomSheet.rating.bad.tag.uninteresting"],
			content["practicalExperience.bottomSheet.rating.bad.tag.tasks"],
			content["practicalExperience.bottomSheet.rating.bad.tag.notMine"],
		],
		ratingIsMedium: [
			content["practicalExperience.bottomSheet.rating.medium.tag.lessStress"],
			content["practicalExperience.bottomSheet.rating.medium.tag.moreVariety"],
			content["practicalExperience.bottomSheet.rating.medium.tag.tasks"],
			content[
				"practicalExperience.bottomSheet.rating.medium.tag.otherLocation"
			],
			content["practicalExperience.bottomSheet.rating.medium.tag.notMine"],
		],
		ratingIsGood: [
			content["practicalExperience.bottomSheet.rating.good.tag.tasks"],
			content["practicalExperience.bottomSheet.rating.good.tag.location"],
			content["practicalExperience.bottomSheet.rating.good.tag.variety"],
			content["practicalExperience.bottomSheet.rating.good.tag.mine"],
		],
	};

	let tagKey: keyof typeof tags;
	if (ratingIsBad) {
		tagKey = "ratingIsBad";
	} else if (ratingIsMedium) {
		tagKey = "ratingIsMedium";
	} else {
		tagKey = "ratingIsGood";
	}

	function handleRatingChange(value: number) {
		setSelectedRating(value);
		setIsRated(true);
		setSelectedTags([]);
	}

	function toggleTag(tag: string) {
		setSelectedTags((prev) =>
			prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
		);
	}
	function handleSubmit() {
		if (selectedRating === 0) {
			return;
		}
		onSubmit(selectedRating, selectedTags);
	}

	return (
		<BottomSheet open={open} onClose={onClose} ariaLabel={ariaLabel}>
			<div className="flex flex-col items-center pb-4  w-full">
				<div className="flex w-full px-2">
					{/* TODO: back button should go to the previous state of the bottom sheet */}
					<GhostIconButton
						onClick={onClose}
						ariaLabel={content["common.bottomSheet.backButtonAriaLabel"]}
						iconSrc="/icons/chevron-back.svg"
					/>
				</div>
				<div className="flex flex-col gap-4 w-full px-4">
					{title && !isRated && (
						<h2 className="text-left self-start text-2xl font-semibold text-gray-900 pt-1 px-1">
							{title || content["practicalExperience.bottomSheet.rating.title"]}
						</h2>
					)}
					<div className="flex flex-col gap-2 w-full">
						<StarRating
							rating={selectedRating}
							maxRating={5}
							onRatingChange={handleRatingChange}
						/>
					</div>
					{isRated && (
						<>
							<h2 className="text-left self-start text-2xl font-semibold text-gray-900 pt-2 px-1">
								{ratingIsBad &&
									content["practicalExperience.bottomSheet.rating.bad.label"]}
								{ratingIsMedium &&
									content[
										"practicalExperience.bottomSheet.rating.medium.label"
									]}
								{ratingIsGood &&
									content["practicalExperience.bottomSheet.rating.good.label"]}
							</h2>
							<div className="min-h-0 flex-1 overflow-y-auto p-3 bg-card-fill rounded-[20px]">
								<ul className="flex flex-wrap gap-x-2 gap-y-2">
									{tags[tagKey].map((item) => (
										<Pill
											key={item}
											label={item}
											selected={selectedTags.includes(item)}
											onClick={() => toggleTag(item)}
											ariaLabel={`${item}`}
											className="text-left w-fit"
										/>
									))}
								</ul>
							</div>
							<PrimaryThemedButton
								onClick={handleSubmit}
								ariaLabel={
									content[
										"practicalExperience.bottomSheet.submitButtonAriaLabel"
									]
								}
							>
								{content["practicalExperience.bottomSheet.submitButtonLabel"]}
							</PrimaryThemedButton>
						</>
					)}
				</div>
			</div>
		</BottomSheet>
	);
}
