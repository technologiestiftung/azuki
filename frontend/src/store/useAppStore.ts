import { create } from "zustand";
import {
	Step,
	type UserProfile,
	type EducationLevel,
	type WorkPreferenceChoice,
	type NoGoAnswer,
	type MatchResult,
} from "../common";

const STEP_ORDER = [
	Step.Login,
	Step.Welcome,
	Step.Start,
	Step.InSchool,
	Step.SchoolDegreeStep,
	Step.SchoolSubjects,
	Step.Interests,
	Step.Strengths,
	Step.WorkValues,
	Step.SecretTalent,
	Step.PracticalExperience,
	Step.WorkPreferences,
	Step.NoGos,
	Step.Loading,
	Step.Results,
];

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
	currentStep: Step;
	profile: UserProfile;
	matchResults: MatchResult | null;
	strengthSubIndex: number;
	noGoSubIndex: number;
	workPrefSubIndex: number;
}

interface AppActions {
	goToStep: (step: Step) => void;
	nextStep: () => void;
	prevStep: () => void;
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
	setStrengthSubIndex: (index: number) => void;
	setNoGoSubIndex: (index: number) => void;
	setWorkPrefSubIndex: (index: number) => void;
	resetProfile: () => void;
}

export const useAppStore = create<AppState & AppActions>((set, get) => ({
	currentStep: Step.Login,
	profile: initialProfile,
	matchResults: null,
	strengthSubIndex: 0,
	noGoSubIndex: 0,
	workPrefSubIndex: 0,

	goToStep: (step) => set({ currentStep: step }),

	nextStep: () => {
		const currentStep = get().currentStep;
		const currentStepIndex = STEP_ORDER.indexOf(currentStep);
		if (currentStepIndex < STEP_ORDER.length - 1) {
			set({ currentStep: STEP_ORDER[currentStepIndex + 1] });
		}
	},

	prevStep: () => {
		const currentStep = get().currentStep;
		const currentStepIndex = STEP_ORDER.indexOf(currentStep);
		if (currentStepIndex > 0) {
			set({ currentStep: STEP_ORDER[currentStepIndex - 1] });
		}
	},

	setInSchool: (value) =>
		set((state) => ({
			profile: { ...state.profile, inSchool: value },
		})),

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

	setStrengthSubIndex: (index) => set({ strengthSubIndex: index }),

	setNoGoSubIndex: (index) => set({ noGoSubIndex: index }),

	setWorkPrefSubIndex: (index) => set({ workPrefSubIndex: index }),
	resetProfile: () =>
		set({
			profile: initialProfile,
			matchResults: null,
			strengthSubIndex: 0,
			noGoSubIndex: 0,
			workPrefSubIndex: 0,
		}),
}));
