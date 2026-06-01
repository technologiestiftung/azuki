import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
	type UserProfile,
	type EducationLevel,
	type WorkPreferenceChoice,
	type NoGoAnswer,
	type AusbildungsplaetzeResponse,
} from "../common";
import { useMatchResultsStore } from "./useMatchResultsStore";

export interface Standort {
	plz: string;
	umkreis: number;
}

const DEFAULT_STANDORT: Standort = { plz: "10115", umkreis: 25 };

const initialProfile: UserProfile = {
	inSchool: null,
	educationLevel: null,
	favoriteSubjects: [],
	customSubjects: [],
	interests: [],
	customInterests: [],
	workExpectations: [],
	strengths: {},
	secretTalent: "",
	practicalExperience: "",
	workPreferences: {},
	noGos: {},
};

/** Normalizes the profile by merging the initial profile with the provided profile. */
function normalizeProfile(
	profile: Partial<UserProfile> | undefined,
): UserProfile {
	const merged = { ...initialProfile, ...profile };
	return {
		...merged,
		favoriteSubjects: merged.favoriteSubjects ?? [],
		customSubjects: merged.customSubjects ?? [],
		interests: merged.interests ?? [],
		customInterests: merged.customInterests ?? [],
		workExpectations: merged.workExpectations ?? [],
		strengths: merged.strengths ?? {},
		workPreferences: merged.workPreferences ?? {},
		noGos: merged.noGos ?? {},
	};
}

// Clears anything derived from the user's profile or matched berufe.
// `useMatchResultsStore` lives in a separate store; `ausbildungsplaetze` is
// keyed to the previous match results, so it must be invalidated together.
function clearMatchResults(): void {
	useMatchResultsStore.getState().clearMatchResults();
	useAppStore.setState({ ausbildungsplaetze: null });
}

interface AppState {
	profile: UserProfile;
	ausbildungsplaetze: AusbildungsplaetzeResponse | null;
	standort: Standort;
}

interface AppActions {
	setInSchool: (value: boolean) => void;
	setEducationLevel: (value: EducationLevel) => void;
	toggleSubject: (subject: string) => void;
	toggleWorkExpectation: (value: string) => void;
	toggleInterest: (interest: string) => void;
	addCustomInterest: (interest: string) => void;
	addCustomSubject: (subject: string) => void;
	setStrength: (id: string, value: number) => void;
	setSecretTalent: (value: string) => void;
	setPracticalExperience: (value: string) => void;
	setWorkPreference: (id: string, choice: WorkPreferenceChoice | null) => void;
	setNoGo: (id: string, answer: NoGoAnswer | null) => void;
	setAusbildungsplaetze: (results: AusbildungsplaetzeResponse | null) => void;
	setStandort: (standort: Partial<Standort>) => void;
	resetProfile: () => void;
}

export const useAppStore = create<AppState & AppActions>()(
	persist(
		(set) => ({
			profile: initialProfile,
			ausbildungsplaetze: null,
			standort: DEFAULT_STANDORT,

			setInSchool: (value) =>
				set((state) => {
					// If the user changes their school status, reset the education level
					// to prevent invalid states (e.g. having "none" selected while being in school)
					const resetEducationLevel = state.profile.inSchool !== value;
					clearMatchResults();
					return {
						profile: {
							...state.profile,
							inSchool: value,
							...(resetEducationLevel ? { educationLevel: null } : {}),
						},
					};
				}),

			setEducationLevel: (value) => {
				clearMatchResults();
				set((state) => ({
					profile: { ...state.profile, educationLevel: value },
				}));
			},

			toggleSubject: (subject) =>
				set((state) => {
					const subjects = state.profile.favoriteSubjects.includes(subject)
						? state.profile.favoriteSubjects.filter(
								(favoriteSubject: string) => favoriteSubject !== subject,
							)
						: [...state.profile.favoriteSubjects, subject];
					clearMatchResults();
					return {
						profile: { ...state.profile, favoriteSubjects: subjects },
					};
				}),
			toggleWorkExpectation: (value) =>
				set((state) => {
					const workExpectations = state.profile.workExpectations.includes(
						value,
					)
						? state.profile.workExpectations.filter(
								(workExpectation: string) => workExpectation !== value,
							)
						: [...state.profile.workExpectations, value];
					clearMatchResults();
					return {
						profile: { ...state.profile, workExpectations },
					};
				}),

			toggleInterest: (interest) =>
				set((state) => {
					const interests = state.profile.interests.includes(interest)
						? state.profile.interests.filter(
								(interestValue: string) => interestValue !== interest,
							)
						: [...state.profile.interests, interest];
					clearMatchResults();
					return {
						profile: { ...state.profile, interests },
					};
				}),

			addCustomInterest: (interest) => {
				clearMatchResults();
				set((state) => ({
					profile: {
						...state.profile,
						customInterests: [...state.profile.customInterests, interest],
						interests: [...state.profile.interests, interest],
					},
				}));
			},
			addCustomSubject: (subject) =>
				set((state) => {
					const customSubjects = state.profile.customSubjects ?? [];
					const favoriteSubjects = state.profile.favoriteSubjects ?? [];
					clearMatchResults();
					return {
						profile: {
							...state.profile,
							customSubjects: [...customSubjects, subject],
							favoriteSubjects: [...favoriteSubjects, subject],
						},
					};
				}),

			setStrength: (id, value) => {
				clearMatchResults();
				set((state) => ({
					profile: {
						...state.profile,
						strengths: { ...state.profile.strengths, [id]: value },
					},
				}));
			},

			setSecretTalent: (value) => {
				clearMatchResults();
				set((state) => ({
					profile: { ...state.profile, secretTalent: value },
				}));
			},

			setPracticalExperience: (value) => {
				clearMatchResults();
				set((state) => ({
					profile: { ...state.profile, practicalExperience: value },
				}));
			},

			setWorkPreference: (id, choice) => {
				clearMatchResults();
				set((state) => ({
					profile: {
						...state.profile,
						workPreferences: {
							...state.profile.workPreferences,
							[id]: choice,
						},
					},
				}));
			},

			setNoGo: (id, answer) => {
				clearMatchResults();
				set((state) => ({
					profile: {
						...state.profile,
						noGos: { ...state.profile.noGos, [id]: answer },
					},
				}));
			},

			setAusbildungsplaetze: (results) => set({ ausbildungsplaetze: results }),

			setStandort: (standort) =>
				set((state) => ({
					standort: { ...state.standort, ...standort },
					// Changing standort invalidates per-beruf counts since they
					// were fetched for the previous location.
					ausbildungsplaetze: null,
				})),

			resetProfile: () => {
				clearMatchResults();
				// standort is a user preference, not derived from profile —
				// keep it across resets.
				set({ profile: initialProfile });
			},
		}),
		{
			name: "azuki-app-store",
			storage: createJSONStorage(() => sessionStorage),
			partialize: (state) => ({
				profile: state.profile,
				standort: state.standort,
			}),
			merge: (persistedState, currentState) => {
				const persisted = persistedState as Partial<AppState> | undefined;
				return {
					...currentState,
					...(persisted ?? {}),
					profile: normalizeProfile(persisted?.profile),
				};
			},
		},
	),
);
