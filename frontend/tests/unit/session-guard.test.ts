import { afterEach, describe, expect, test, vi } from "vitest";
import {
	hasLocalSession,
	hasPersistedSession,
	hasProfileSession,
	hasResultsSession,
	hasShareQueryParams,
	toWithShareSearch,
} from "../../src/routing/sessionGuard";
import { useAppStore } from "../../src/store/useAppStore";
import { useMatchResultsStore } from "../../src/store/useMatchResultsStore";
import { initialUserProfile } from "../../src/profile/initialUserProfile";

describe("sessionGuard", () => {
	test("hasShareQueryParams detects known share params", () => {
		expect(hasShareQueryParams(new URLSearchParams())).toBe(false);
		expect(hasShareQueryParams(new URLSearchParams({ o: "123-85" }))).toBe(
			true,
		);
		expect(hasShareQueryParams(new URLSearchParams({ p: "abc" }))).toBe(true);
		expect(hasShareQueryParams(new URLSearchParams({ fit: "85" }))).toBe(true);
		expect(hasShareQueryParams(new URLSearchParams({ foo: "bar" }))).toBe(
			false,
		);
	});

	test("toWithShareSearch preserves share params and drops others", () => {
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

	test("hasLocalSession is false for empty stores", () => {
		useMatchResultsStore.setState({ matchResults: null });
		useAppStore.setState({ profile: initialUserProfile });

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
		useAppStore.setState({ profile: initialUserProfile });

		expect(hasLocalSession()).toBe(true);
		expect(hasResultsSession()).toBe(true);
		expect(hasProfileSession()).toBe(false);
	});

	test("hasLocalSession is true when questionnaire was started, but results session is not", () => {
		useMatchResultsStore.setState({ matchResults: null });
		useAppStore.setState({
			profile: { ...initialUserProfile, inSchool: true },
		});

		expect(hasLocalSession()).toBe(true);
		expect(hasResultsSession()).toBe(false);
		expect(hasProfileSession()).toBe(true);
	});

	test("hasPersistedSession reads sessionStorage", () => {
		const store = new Map<string, string>();
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

	afterEach(() => {
		vi.unstubAllGlobals();
	});
});
