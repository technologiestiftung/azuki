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

		void Promise.all(
			occupationIds.map(async (id) => {
				const occupation = await getOccupation(id);
				return {
					id: occupation.id,
					displayName: formatOccupationDisplayName(occupation.name),
					imageUrl: occupation.images[0]?.url ?? PLACEHOLDER_IMAGE,
				};
			}),
		)
			.then((results) => {
				if (!cancelled) {
					setCards(results);
				}
			})
			.catch(() => {
				if (!cancelled) {
					setCards([]);
				}
			});

		return () => {
			cancelled = true;
		};
	}, [occupationIds]);

	return cards;
}
