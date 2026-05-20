import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
	type UserProfile,
	type EducationLevel,
	type WorkPreferenceChoice,
	type NoGoAnswer,
} from "../common";
import {
	initialUserProfile,
	normalizeUserProfile,
} from "../profile/normalizeUserProfile";
import { useMatchResultsStore } from "./useMatchResultsStore";

function clearMatchResults(): void {
	useMatchResultsStore.getState().clearMatchResults();
}

interface AppState {
	profile: UserProfile;
}

interface AppActions {
	setInSchool: (value: boolean) => void;
	setEducationLevel: (value: EducationLevel) => void;
	toggleSubject: (subject: string) => void;
	toggleWorkExpectation: (value: string) => void;
	toggleInterest: (interest: string) => void;
	addCustomInterest: (interest: string) => void;
	addCustomSubject: (subject: string) => void;
	addCustomWorkExpectation: (workExpectation: string) => void;
	addCustomStrength: (strength: string) => void;
	toggleCustomStrength: (strength: string) => void;
	setStrength: (id: string, value: number) => void;
	setPracticalExperience: (value: string) => void;
	setWorkPreference: (id: string, choice: WorkPreferenceChoice | null) => void;
	setNoGo: (id: string, answer: NoGoAnswer | null) => void;
	resetProfile: () => void;
}

export const useAppStore = create<AppState & AppActions>()(
	persist(
		(set) => ({
			profile: initialUserProfile,

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

			addCustomWorkExpectation: (workExpectation) => {
				clearMatchResults();
				set((state) => ({
					profile: {
						...state.profile,
						customWorkExpectations: [
							...state.profile.customWorkExpectations,
							workExpectation,
						],
						workExpectations: [
							...state.profile.workExpectations,
							workExpectation,
						],
					},
				}));
			},

			addCustomStrength: (strength) => {
				clearMatchResults();
				set((state) => {
					if (state.profile.customStrengths.includes(strength)) {
						return state;
					}
					return {
						profile: {
							...state.profile,
							customStrengths: [...state.profile.customStrengths, strength],
							selectedCustomStrengths: [
								...state.profile.selectedCustomStrengths,
								strength,
							],
						},
					};
				});
			},

			toggleCustomStrength: (strength) => {
				clearMatchResults();
				set((state) => {
					const selected = state.profile.selectedCustomStrengths.includes(
						strength,
					)
						? state.profile.selectedCustomStrengths.filter(
								(value) => value !== strength,
							)
						: [...state.profile.selectedCustomStrengths, strength];
					return {
						profile: {
							...state.profile,
							selectedCustomStrengths: selected,
						},
					};
				});
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

			resetProfile: () => {
				clearMatchResults();
				set({ profile: initialUserProfile });
			},
		}),
		{
			name: "azuki-app-store",
			storage: createJSONStorage(() => sessionStorage),
			partialize: (state) => ({
				profile: state.profile,
			}),
			merge: (persistedState, currentState) => {
				const persisted = persistedState as Partial<AppState> | undefined;
				return {
					...currentState,
					...(persisted ?? {}),
					profile: normalizeUserProfile(persisted?.profile),
				};
			},
		},
	),
);
