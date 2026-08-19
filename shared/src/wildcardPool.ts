/**
 * Fixed pool of berufe.json ids curated as (high-demand) apprenticeship
 * occupations by JOBLINGE. The results page always samples a random 5.
 */
export const WILDCARD_POOL_OCCUPATION_IDS: number[] = [
	6580, 6628, 10236, 27539, 27448, 588, 33212, 15164, 6717, 6712, 70148, 14463,
	14704, 129406, 136125, 136126, 15621, 134715, 15636, 134721, 2927, 122382,
	129408, 7573, 13794, 29053, 122288, 4460, 126805, 126807, 126803, 34980, 4188,
	10009, 2168, 4105, 4303, 15623, 76430, 2774, 35283, 143399, 132173, 139142,
	77495, 134955, 15532, 134954, 15530, 15534, 132661, 132660, 139143, 139147,
	132659, 133596, 133597, 139146,
];

const WILDCARD_POOL_ID_SET = new Set(WILDCARD_POOL_OCCUPATION_IDS);

export function isInWildcardPool(id: number): boolean {
	return WILDCARD_POOL_ID_SET.has(id);
}
