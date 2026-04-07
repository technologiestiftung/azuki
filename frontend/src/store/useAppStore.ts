import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
	type UserProfile,
	type EducationLevel,
	type WorkPreferenceChoice,
	type NoGoAnswer,
	type MatchResult,
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

interface AppState {
	profile: UserProfile;
	matchResults: MatchResult | null;
	selectedModel: string | null;
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
	setSelectedModel: (model: string | null) => void;
	resetProfile: () => void;
}

export const useAppStore = create<AppState & AppActions>()(
	persist(
		(set) => ({
			profile: initialProfile,
			matchResults: null,
			selectedModel: null,

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
					};
				}),

			setEducationLevel: (value) =>
				set((state) => ({
					profile: { ...state.profile, educationLevel: value },
					matchResults: null,
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
					};
				}),

			setStrength: (id, value) =>
				set((state) => ({
					profile: {
						...state.profile,
						strengths: { ...state.profile.strengths, [id]: value },
					},
					matchResults: null,
				})),

			setSecretTalent: (value) =>
				set((state) => ({
					profile: { ...state.profile, secretTalent: value },
					matchResults: null,
				})),

			setPracticalExperience: (value) =>
				set((state) => ({
					profile: { ...state.profile, practicalExperience: value },
					matchResults: null,
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
				})),

			setNoGo: (id, answer) =>
				set((state) => ({
					profile: {
						...state.profile,
						noGos: { ...state.profile.noGos, [id]: answer },
					},
					matchResults: null,
				})),

			setMatchResults: (results) => set({ matchResults: results }),

			setSelectedModel: (model) => set({ selectedModel: model }),

			resetProfile: () =>
				set({
					profile: initialProfile,
					matchResults: null,
				}),
		}),
		{
			name: "azuki-app-store",
			storage: createJSONStorage(() => sessionStorage),
			partialize: (state) => ({
				profile: state.profile,
				matchResults: state.matchResults,
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
