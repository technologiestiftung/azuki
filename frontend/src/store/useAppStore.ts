import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
	type UserProfile,
	type EducationLevel,
	type WorkPreferenceChoice,
	type NoGoAnswer,
	type MatchResult,
	type AusbildungsplaetzeResponse,
} from "../common";

const initialProfile: UserProfile = {
	inSchool: null,
	educationLevel: null,
	favoriteSubjects: [],
	customSubjects: [],
	interests: [],
	customInterests: [],
	workValues: [],
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
		workValues: merged.workValues ?? [],
		strengths: merged.strengths ?? {},
		workPreferences: merged.workPreferences ?? {},
		noGos: merged.noGos ?? {},
	};
}

export interface Standort {
	plz: string;
	umkreis: number;
}

const DEFAULT_STANDORT: Standort = { plz: "10115", umkreis: 25 };

interface AppState {
	profile: UserProfile;
	matchResults: MatchResult | null;
	ausbildungsplaetze: AusbildungsplaetzeResponse | null;
	standort: Standort;
}

interface AppActions {
	setInSchool: (value: boolean) => void;
	setEducationLevel: (value: EducationLevel) => void;
	toggleSubject: (subject: string) => void;
	toggleWorkValue: (value: string) => void;
	toggleInterest: (interest: string) => void;
	addCustomInterest: (interest: string) => void;
	addCustomSubject: (subject: string) => void;
	setStrength: (id: string, value: number) => void;
	setSecretTalent: (value: string) => void;
	setPracticalExperience: (value: string) => void;
	setWorkPreference: (id: string, choice: WorkPreferenceChoice) => void;
	setNoGo: (id: string, answer: NoGoAnswer | null) => void;
	setMatchResults: (results: MatchResult) => void;
	setAusbildungsplaetze: (results: AusbildungsplaetzeResponse | null) => void;
	setStandort: (standort: Partial<Standort>) => void;
	resetProfile: () => void;
}

export const useAppStore = create<AppState & AppActions>()(
	persist(
		(set) => ({
			profile: initialProfile,
			matchResults: null,
			ausbildungsplaetze: null,
			standort: DEFAULT_STANDORT,

			setInSchool: (value) =>
				set((state) => {
					// If the user changes their school status, reset the education level
					// to prevent invalid states (e.g. having "none" selected while being in school)
					const resetEducationLevel = state.profile.inSchool !== value;
					return {
						profile: {
							...state.profile,
							inSchool: value,
							...(resetEducationLevel ? { educationLevel: null } : {}),
						},
						matchResults: null,
						ausbildungsplaetze: null,
					};
				}),

			setEducationLevel: (value) =>
				set((state) => ({
					profile: { ...state.profile, educationLevel: value },
					matchResults: null,
					ausbildungsplaetze: null,
				})),

			toggleSubject: (subject) =>
				set((state) => {
					const subjects = state.profile.favoriteSubjects.includes(subject)
						? state.profile.favoriteSubjects.filter(
								(favoriteSubject: string) => favoriteSubject !== subject,
							)
						: [...state.profile.favoriteSubjects, subject];
					return {
						profile: { ...state.profile, favoriteSubjects: subjects },
						matchResults: null,
						ausbildungsplaetze: null,
					};
				}),
			toggleWorkValue: (value) =>
				set((state) => {
					const workValues = state.profile.workValues.includes(value)
						? state.profile.workValues.filter(
								(workValue: string) => workValue !== value,
							)
						: [...state.profile.workValues, value];
					return {
						profile: { ...state.profile, workValues },
						matchResults: null,
						ausbildungsplaetze: null,
					};
				}),

			toggleInterest: (interest) =>
				set((state) => {
					const interests = state.profile.interests.includes(interest)
						? state.profile.interests.filter(
								(interestValue: string) => interestValue !== interest,
							)
						: [...state.profile.interests, interest];
					return {
						profile: { ...state.profile, interests },
						matchResults: null,
						ausbildungsplaetze: null,
					};
				}),

			addCustomInterest: (interest) =>
				set((state) => ({
					profile: {
						...state.profile,
						customInterests: [...state.profile.customInterests, interest],
						interests: [...state.profile.interests, interest],
					},
					matchResults: null,
					ausbildungsplaetze: null,
				})),
			addCustomSubject: (subject) =>
				set((state) => {
					const customSubjects = state.profile.customSubjects ?? [];
					const favoriteSubjects = state.profile.favoriteSubjects ?? [];
					return {
						profile: {
							...state.profile,
							customSubjects: [...customSubjects, subject],
							favoriteSubjects: [...favoriteSubjects, subject],
						},
						matchResults: null,
						ausbildungsplaetze: null,
					};
				}),

			setStrength: (id, value) =>
				set((state) => ({
					profile: {
						...state.profile,
						strengths: { ...state.profile.strengths, [id]: value },
					},
					matchResults: null,
					ausbildungsplaetze: null,
				})),

			setSecretTalent: (value) =>
				set((state) => ({
					profile: { ...state.profile, secretTalent: value },
					matchResults: null,
					ausbildungsplaetze: null,
				})),

			setPracticalExperience: (value) =>
				set((state) => ({
					profile: { ...state.profile, practicalExperience: value },
					matchResults: null,
					ausbildungsplaetze: null,
				})),

			setWorkPreference: (id, choice) =>
				set((state) => ({
					profile: {
						...state.profile,
						workPreferences: {
							...state.profile.workPreferences,
							[id]: choice,
						},
					},
					matchResults: null,
					ausbildungsplaetze: null,
				})),

			setNoGo: (id, answer) =>
				set((state) => ({
					profile: {
						...state.profile,
						noGos: { ...state.profile.noGos, [id]: answer },
					},
					matchResults: null,
					ausbildungsplaetze: null,
				})),

			setMatchResults: (results) => set({ matchResults: results }),

			setAusbildungsplaetze: (results) => set({ ausbildungsplaetze: results }),

			setStandort: (standort) =>
				set((state) => ({
					standort: { ...state.standort, ...standort },
					// Changing standort invalidates per-beruf counts since they
					// were fetched for the previous location.
					ausbildungsplaetze: null,
				})),

			resetProfile: () =>
				set({
					profile: initialProfile,
					matchResults: null,
					ausbildungsplaetze: null,
					// standort is user preference, not derived from profile —
					// keep it across resets.
				}),
		}),
		{
			name: "azuki-app-store",
			storage: createJSONStorage(() => sessionStorage),
			partialize: (state) => ({
				profile: state.profile,
				matchResults: state.matchResults,
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
