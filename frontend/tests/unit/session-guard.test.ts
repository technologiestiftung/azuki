import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
	hasLocalSession,
	hasPersistedSession,
	hasProfileSession,
	hasProfileShareParams,
	hasResultsSession,
	hasResultsShareParams,
	hasShareQueryParams,
	pickShareSearchParams,
	shouldShowBottomNav,
	toWithShareSearch,
} from "../../src/routing/sessionGuard";
import { useAppStore } from "../../src/store/useAppStore";
import { useMatchResultsStore } from "../../src/store/useMatchResultsStore";
import { initialUserProfile } from "../../src/profile/initialUserProfile";

function resetStores() {
	useMatchResultsStore.setState({ matchResults: null });
	useAppStore.setState({ profile: initialUserProfile });
}

describe("sessionGuard", () => {
	beforeEach(() => {
		resetStores();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		resetStores();
	});

	describe("share query params", () => {
		test("hasShareQueryParams detects o, p, and fit", () => {
			expect(hasShareQueryParams(new URLSearchParams())).toBe(false);
			expect(hasShareQueryParams(new URLSearchParams({ o: "123-85" }))).toBe(
				true,
			);
			expect(hasShareQueryParams(new URLSearchParams({ p: "abc" }))).toBe(true);
			expect(hasShareQueryParams(new URLSearchParams({ fit: "85" }))).toBe(
				true,
			);
			expect(hasShareQueryParams(new URLSearchParams({ foo: "bar" }))).toBe(
				false,
			);
		});

		test("next alone is not a share bypass param", () => {
			expect(hasShareQueryParams(new URLSearchParams({ next: "1,2,3" }))).toBe(
				false,
			);
			expect(
				hasResultsShareParams(new URLSearchParams({ next: "1,2,3" })),
			).toBe(false);
		});

		test("empty string values still count as present", () => {
			expect(hasShareQueryParams(new URLSearchParams({ o: "" }))).toBe(true);
			expect(hasShareQueryParams(new URLSearchParams({ fit: "" }))).toBe(true);
			expect(hasProfileShareParams(new URLSearchParams({ p: "" }))).toBe(true);
		});

		test("results share bypass ignores profile-only p param", () => {
			expect(hasResultsShareParams(new URLSearchParams({ p: "abc" }))).toBe(
				false,
			);
			expect(hasResultsShareParams(new URLSearchParams({ o: "123-85" }))).toBe(
				true,
			);
			expect(hasResultsShareParams(new URLSearchParams({ fit: "90" }))).toBe(
				true,
			);
		});

		test("profile share bypass ignores results-only o/fit params", () => {
			expect(hasProfileShareParams(new URLSearchParams({ o: "123-85" }))).toBe(
				false,
			);
			expect(hasProfileShareParams(new URLSearchParams({ fit: "90" }))).toBe(
				false,
			);
			expect(hasProfileShareParams(new URLSearchParams({ p: "abc" }))).toBe(
				true,
			);
		});
	});

	describe("toWithShareSearch / pickShareSearchParams", () => {
		test("preserves share params and drops unrelated ones", () => {
			const params = new URLSearchParams({
				o: "123-85",
				plz: "10115",
				d: "25",
				foo: "bar",
			});

			expect(toWithShareSearch("/results/vacancies", params)).toEqual({
				pathname: "/results/vacancies",
				search: "o=123-85&plz=10115&d=25",
			});
			expect(toWithShareSearch("/results/1", new URLSearchParams())).toBe(
				"/results/1",
			);
		});

		test("preserves occupation detail share params fit and next", () => {
			const params = new URLSearchParams({
				fit: "90",
				next: "7847,7856",
				utm: "share",
			});

			expect(toWithShareSearch("/results/apprenticeships", params)).toEqual({
				pathname: "/results/apprenticeships",
				search: "fit=90&next=7847%2C7856",
			});
		});

		test("preserves combined list and detail share params", () => {
			const params = new URLSearchParams({
				o: "8533-91",
				fit: "91",
				next: "1,2",
				plz: "10115",
				d: "10",
				p: "profiletoken",
			});
			const picked = pickShareSearchParams(params);

			expect(picked.get("o")).toBe("8533-91");
			expect(picked.get("fit")).toBe("91");
			expect(picked.get("next")).toBe("1,2");
			expect(picked.get("plz")).toBe("10115");
			expect(picked.get("d")).toBe("10");
			expect(picked.get("p")).toBe("profiletoken");
			expect(picked.has("utm")).toBe(false);
		});
	});

	describe("session checks", () => {
		test("empty stores have no session", () => {
			expect(hasLocalSession()).toBe(false);
			expect(hasResultsSession()).toBe(false);
			expect(hasProfileSession()).toBe(false);
		});

		test("match results alone are not a profile session", () => {
			useMatchResultsStore.setState({
				matchResults: {
					occupations: [],
				},
			});

			expect(hasLocalSession()).toBe(true);
			expect(hasResultsSession()).toBe(true);
			expect(hasProfileSession()).toBe(false);
		});

		test("inSchool false still counts as a started questionnaire", () => {
			useAppStore.setState({
				profile: { ...initialUserProfile, inSchool: false },
			});

			expect(hasLocalSession()).toBe(true);
			expect(hasProfileSession()).toBe(true);
			expect(hasResultsSession()).toBe(false);
		});

		test("inSchool true without match results is not a results session", () => {
			useAppStore.setState({
				profile: { ...initialUserProfile, inSchool: true },
			});

			expect(hasLocalSession()).toBe(true);
			expect(hasResultsSession()).toBe(false);
			expect(hasProfileSession()).toBe(true);
		});

		test("full session has both profile and results", () => {
			useMatchResultsStore.setState({
				matchResults: { occupations: [] },
			});
			useAppStore.setState({
				profile: { ...initialUserProfile, inSchool: true },
			});

			expect(hasLocalSession()).toBe(true);
			expect(hasResultsSession()).toBe(true);
			expect(hasProfileSession()).toBe(true);
		});
	});

	describe("shouldShowBottomNav", () => {
		test("hidden without questionnaire progress", () => {
			expect(shouldShowBottomNav(null, new URLSearchParams())).toBe(false);
		});

		test("shown for own session without share params", () => {
			expect(shouldShowBottomNav(true, new URLSearchParams())).toBe(true);
			expect(shouldShowBottomNav(false, new URLSearchParams())).toBe(true);
		});

		test("hidden for any share param type, even with own session", () => {
			expect(
				shouldShowBottomNav(true, new URLSearchParams({ o: "123-85" })),
			).toBe(false);
			expect(
				shouldShowBottomNav(true, new URLSearchParams({ fit: "90" })),
			).toBe(false);
			expect(shouldShowBottomNav(true, new URLSearchParams({ p: "abc" }))).toBe(
				false,
			);
		});

		test("fit without o still hides nav (padding stays aligned)", () => {
			expect(
				shouldShowBottomNav(
					true,
					new URLSearchParams({ fit: "90", next: "1" }),
				),
			).toBe(false);
		});
	});

	describe("hasPersistedSession", () => {
		function stubSessionStorage(store: Map<string, string>) {
			vi.stubGlobal("sessionStorage", {
				getItem: (key: string) => store.get(key) ?? null,
				setItem: (key: string, value: string) => {
					store.set(key, value);
				},
				removeItem: (key: string) => {
					store.delete(key);
				},
				clear: () => {
					store.clear();
				},
				length: 0,
				key: () => null,
			});
		}

		test("reads valid match results and profile from sessionStorage", () => {
			const store = new Map<string, string>();
			stubSessionStorage(store);

			expect(hasPersistedSession()).toBe(false);

			store.set(
				"azuki-match-results-store",
				JSON.stringify({
					state: {
						matchResults: { occupations: [] },
					},
					version: 0,
				}),
			);
			expect(hasPersistedSession()).toBe(true);

			store.clear();
			store.set(
				"azuki-app-store",
				JSON.stringify({
					state: {
						profile: { inSchool: false },
					},
					version: 0,
				}),
			);
			expect(hasPersistedSession()).toBe(true);
		});

		test("ignores null matchResults and null inSchool in storage", () => {
			const store = new Map<string, string>();
			stubSessionStorage(store);

			store.set(
				"azuki-match-results-store",
				JSON.stringify({
					state: { matchResults: null },
					version: 0,
				}),
			);
			expect(hasPersistedSession()).toBe(false);

			store.clear();
			store.set(
				"azuki-app-store",
				JSON.stringify({
					state: { profile: { inSchool: null } },
					version: 0,
				}),
			);
			expect(hasPersistedSession()).toBe(false);
		});

		test("ignores corrupt or empty persisted payloads", () => {
			const store = new Map<string, string>();
			stubSessionStorage(store);

			store.set("azuki-match-results-store", "{not-json");
			expect(hasPersistedSession()).toBe(false);

			store.set("azuki-match-results-store", "");
			expect(hasPersistedSession()).toBe(false);

			store.set("azuki-app-store", JSON.stringify({ version: 0 }));
			expect(hasPersistedSession()).toBe(false);
		});

		test("returns false when sessionStorage is unavailable", () => {
			vi.stubGlobal("sessionStorage", undefined);
			expect(hasPersistedSession()).toBe(false);
		});
	});
});
