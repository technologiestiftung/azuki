export interface CustomEntryArrays {
	all: string[];
	custom: string[];
}

export function addCustomEntry(
	value: string,
	all: string[],
	custom: string[],
): CustomEntryArrays {
	const trimmed = value.trim();
	if (!trimmed) {
		return { all, custom };
	}
	if (custom.includes(trimmed)) {
		return { all, custom };
	}
	return {
		all: all.includes(trimmed) ? all : [...all, trimmed],
		custom: [...custom, trimmed],
	};
}

export function removeCustomEntry(
	value: string,
	all: string[],
	custom: string[],
): CustomEntryArrays {
	return {
		all: all.filter((v) => v !== value),
		custom: custom.filter((v) => v !== value),
	};
}
