import { beforeEach, describe, expect, test, vi } from "vitest";
import type { Persona } from "@azuki/shared";

const baseProfile = {
	inSchool: false,
	educationLevel: "secondary" as const,
	favoriteSubjects: [],
	customSubjects: [],
	interests: [],
	customInterests: [],
	workExpectations: [],
	customWorkExpectations: [],
	strengths: {},
	customStrengths: [],
	selectedCustomStrengths: [],
	practicalExperience: "",
	workPreferences: {},
	noGos: {},
};

function makePersona(id: string): Persona {
	return {
		id,
		name: id,
		description: null,
		profile: baseProfile,
		tierS: [],
		tierA: [],
		tierC: [],
		createdAt: "2026-05-12T00:00:00Z",
		updatedAt: "2026-05-12T00:00:00Z",
	};
}

function installFakeLocalStorage(): Storage {
	const data = new Map<string, string>();
	const storage: Storage = {
		get length() {
			return data.size;
		},
		clear: () => data.clear(),
		getItem: (k) => data.get(k) ?? null,
		key: (i) => Array.from(data.keys())[i] ?? null,
		removeItem: (k) => {
			data.delete(k);
		},
		setItem: (k, v) => {
			data.set(k, v);
		},
	};
	(globalThis as unknown as { window: unknown }).window = {
		localStorage: storage,
	};
	(globalThis as unknown as { localStorage: Storage }).localStorage = storage;
	return storage;
}

async function loadFreshStore(personas: Persona[]) {
	vi.resetModules();
	vi.doMock("../../src/api/client", () => ({
		listPersonas: vi.fn(async () => personas),
	}));
	const mod = await import("../../src/store/useEvalStore");
	return mod.useEvalStore;
}

describe("useEvalStore — fetchPersonas", () => {
	beforeEach(() => {
		installFakeLocalStorage();
	});

	test("seeds selectedPersonaIds to all returned ids when previously empty", async () => {
		const useEvalStore = await loadFreshStore([
			makePersona("a"),
			makePersona("b"),
		]);
		await useEvalStore.getState().fetchPersonas();
		const { personas, selectedPersonaIds } = useEvalStore.getState();
		expect(personas?.map((p) => p.id)).toEqual(["a", "b"]);
		expect(Array.from(selectedPersonaIds).sort()).toEqual(["a", "b"]);
	});

	test("preserves existing selectedPersonaIds when non-empty", async () => {
		globalThis.localStorage.setItem(
			"eval.selectedPersonaIds",
			JSON.stringify(["a"]),
		);
		const useEvalStore = await loadFreshStore([
			makePersona("a"),
			makePersona("b"),
		]);
		await useEvalStore.getState().fetchPersonas();
		const { selectedPersonaIds } = useEvalStore.getState();
		expect(Array.from(selectedPersonaIds)).toEqual(["a"]);
	});
});

describe("useEvalStore — addPersona", () => {
	beforeEach(() => {
		installFakeLocalStorage();
	});

	test("appends to personas and adds id to selectedPersonaIds", async () => {
		const useEvalStore = await loadFreshStore([makePersona("a")]);
		await useEvalStore.getState().fetchPersonas();
		useEvalStore.getState().addPersona(makePersona("b"));
		const { personas, selectedPersonaIds } = useEvalStore.getState();
		expect(personas?.map((p) => p.id)).toEqual(["a", "b"]);
		expect(selectedPersonaIds.has("b")).toBe(true);
	});

	test("initializes personas to [p] when previously null", async () => {
		const useEvalStore = await loadFreshStore([]);
		// do NOT call fetchPersonas — leave personas === null
		useEvalStore.getState().addPersona(makePersona("a"));
		const { personas, selectedPersonaIds } = useEvalStore.getState();
		expect(personas?.map((p) => p.id)).toEqual(["a"]);
		expect(selectedPersonaIds.has("a")).toBe(true);
	});

	test("persists updated selection to localStorage", async () => {
		const useEvalStore = await loadFreshStore([makePersona("a")]);
		await useEvalStore.getState().fetchPersonas();
		useEvalStore.getState().addPersona(makePersona("b"));
		const raw = globalThis.localStorage.getItem("eval.selectedPersonaIds");
		expect(raw).not.toBeNull();
		expect(new Set(JSON.parse(raw as string))).toEqual(new Set(["a", "b"]));
	});
});

describe("useEvalStore — replacePersona", () => {
	beforeEach(() => {
		installFakeLocalStorage();
	});

	test("swaps the matching entry in personas", async () => {
		const useEvalStore = await loadFreshStore([
			makePersona("a"),
			makePersona("b"),
		]);
		await useEvalStore.getState().fetchPersonas();
		const renamed: Persona = { ...makePersona("a"), name: "Renamed" };
		useEvalStore.getState().replacePersona(renamed);
		const { personas } = useEvalStore.getState();
		expect(personas?.find((p) => p.id === "a")?.name).toBe("Renamed");
		expect(personas?.find((p) => p.id === "b")?.name).toBe("b");
	});

	test("no-op when no matching id exists", async () => {
		const useEvalStore = await loadFreshStore([makePersona("a")]);
		await useEvalStore.getState().fetchPersonas();
		const before = useEvalStore.getState().personas;
		useEvalStore.getState().replacePersona(makePersona("ghost"));
		const after = useEvalStore.getState().personas;
		expect(after?.map((p) => p.id)).toEqual(["a"]);
		// identity preserved — same array reference when no match
		expect(after).toBe(before);
	});

	test("does not modify selectedPersonaIds", async () => {
		const useEvalStore = await loadFreshStore([makePersona("a")]);
		await useEvalStore.getState().fetchPersonas();
		const before = useEvalStore.getState().selectedPersonaIds;
		useEvalStore.getState().replacePersona({ ...makePersona("a"), name: "x" });
		expect(useEvalStore.getState().selectedPersonaIds).toBe(before);
	});
});

describe("useEvalStore — removePersona", () => {
	beforeEach(() => {
		installFakeLocalStorage();
	});

	test("filters id out of personas and selectedPersonaIds", async () => {
		const useEvalStore = await loadFreshStore([
			makePersona("a"),
			makePersona("b"),
		]);
		await useEvalStore.getState().fetchPersonas();
		useEvalStore.getState().removePersona("a");
		const { personas, selectedPersonaIds } = useEvalStore.getState();
		expect(personas?.map((p) => p.id)).toEqual(["b"]);
		expect(selectedPersonaIds.has("a")).toBe(false);
		expect(selectedPersonaIds.has("b")).toBe(true);
	});

	test("persists the updated selection to localStorage", async () => {
		const useEvalStore = await loadFreshStore([
			makePersona("a"),
			makePersona("b"),
		]);
		await useEvalStore.getState().fetchPersonas();
		useEvalStore.getState().removePersona("a");
		const raw = globalThis.localStorage.getItem("eval.selectedPersonaIds");
		expect(new Set(JSON.parse(raw as string))).toEqual(new Set(["b"]));
	});

	test("no-op when personas is null", async () => {
		const useEvalStore = await loadFreshStore([]);
		useEvalStore.getState().removePersona("a");
		expect(useEvalStore.getState().personas).toBeNull();
	});
});
