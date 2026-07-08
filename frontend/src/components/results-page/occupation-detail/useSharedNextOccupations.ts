import { useEffect, useState } from "react";
import { formatOccupationDisplayName } from "@azuki/shared";
import { getOccupation } from "../../../api/client";

export interface SharedNextOccupationCard {
	id: number;
	displayName: string;
	imageUrl: string;
}

const PLACEHOLDER_IMAGE = "/illustrations/occupation-placeholder.svg";

export function useSharedNextOccupations(
	occupationIds: number[] | undefined,
): SharedNextOccupationCard[] {
	const [cards, setCards] = useState<SharedNextOccupationCard[]>([]);

	useEffect(() => {
		if (!occupationIds || occupationIds.length === 0) {
			setCards([]);
			return undefined;
		}

		let cancelled = false;

		void Promise.allSettled(
			occupationIds.map(async (id) => {
				const occupation = await getOccupation(id);
				return {
					id: occupation.id,
					displayName: formatOccupationDisplayName(occupation.name),
					imageUrl: occupation.images[0]?.url ?? PLACEHOLDER_IMAGE,
				};
			}),
		).then((results) => {
			if (cancelled) {
				return;
			}
			const fulfilled = results.flatMap((result) =>
				result.status === "fulfilled" ? [result.value] : [],
			);
			setCards(fulfilled);
		});

		return () => {
			cancelled = true;
		};
	}, [occupationIds]);

	return cards;
}
