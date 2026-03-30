import { create } from "zustand";
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
	interests: [],
	customInterests: [],
	workValues: [],
	strengths: {},
	secretTalent: "",
	practicalExperience: "",
	workPreferences: {},
	noGos: {},
};

interface AppState {
	profile: UserProfile;
	matchResults: MatchResult | null;
}

interface AppActions {
	setInSchool: (value: boolean) => void;
	setEducationLevel: (value: EducationLevel) => void;
	toggleSubject: (subject: string) => void;
	toggleWorkValue: (value: string) => void;
	toggleInterest: (interest: string) => void;
	addCustomInterest: (interest: string) => void;
	setStrength: (id: string, value: number) => void;
	setSecretTalent: (value: string) => void;
	setPracticalExperience: (value: string) => void;
	setWorkPreference: (id: string, choice: WorkPreferenceChoice) => void;
	setNoGo: (id: string, answer: NoGoAnswer) => void;
	setMatchResults: (results: MatchResult) => void;
	resetProfile: () => void;
}

export const useAppStore = create<AppState & AppActions>((set) => ({
	profile: initialProfile,
	matchResults: null,

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
			};
		}),

	setEducationLevel: (value) =>
		set((state) => ({
			profile: { ...state.profile, educationLevel: value },
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
			};
		}),

	addCustomInterest: (interest) =>
		set((state) => ({
			profile: {
				...state.profile,
				customInterests: [...state.profile.customInterests, interest],
				interests: [...state.profile.interests, interest],
			},
		})),

	setStrength: (id, value) =>
		set((state) => ({
			profile: {
				...state.profile,
				strengths: { ...state.profile.strengths, [id]: value },
			},
		})),

	setSecretTalent: (value) =>
		set((state) => ({
			profile: { ...state.profile, secretTalent: value },
		})),

	setPracticalExperience: (value) =>
		set((state) => ({
			profile: { ...state.profile, practicalExperience: value },
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
		})),

	setNoGo: (id, answer) =>
		set((state) => ({
			profile: {
				...state.profile,
				noGos: { ...state.profile.noGos, [id]: answer },
			},
		})),

	setMatchResults: (results) => set({ matchResults: results }),

	resetProfile: () =>
		set({
			profile: initialProfile,
			matchResults: null,
		}),
}));
