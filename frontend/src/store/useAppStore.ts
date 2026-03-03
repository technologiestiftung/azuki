import { create } from "zustand";
import {
	Step,
	type UserProfile,
	type SchoolDegree,
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
	Step.SecretTalent,
	Step.PracticalExperience,
	Step.WorkPreferences,
	Step.NoGos,
	Step.Loading,
	Step.Results,
];

const initialProfile: UserProfile = {
	schulabschluss: null,
	lieblingsfaecher: [],
	interessen: [],
	customInteressen: [],
	staerken: {},
	geheimesTalent: "",
	praktischeErfahrungen: "",
	arbeitsbedingungen: {},
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
	setSchoolDegree: (value: SchoolDegree) => void;
	toggleSubject: (subject: string) => void;
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
}

export const useAppStore = create<AppState & AppActions>((set, get) => ({
	// Initial state
	currentStep: Step.Login,
	profile: initialProfile,
	matchResults: null,
	strengthSubIndex: 0,
	noGoSubIndex: 0,
	workPrefSubIndex: 0,

	// Actions
	goToStep: (step) => set({ currentStep: step }),

	nextStep: () => {
		const currentStep = get().currentStep;
		const idx = STEP_ORDER.indexOf(currentStep);
		if (idx < STEP_ORDER.length - 1) {
			set({ currentStep: STEP_ORDER[idx + 1] });
		}
	},

	prevStep: () => {
		const currentStep = get().currentStep;
		const idx = STEP_ORDER.indexOf(currentStep);
		if (idx > 0) {
			set({ currentStep: STEP_ORDER[idx - 1] });
		}
	},

	setSchoolDegree: (value) =>
		set((state) => ({
			profile: { ...state.profile, schulabschluss: value },
		})),

	toggleSubject: (subject) =>
		set((state) => {
			const subjects = state.profile.lieblingsfaecher.includes(subject)
				? state.profile.lieblingsfaecher.filter((s) => s !== subject)
				: [...state.profile.lieblingsfaecher, subject];
			return {
				profile: { ...state.profile, lieblingsfaecher: subjects },
			};
		}),

	toggleInterest: (interest) =>
		set((state) => {
			const interests = state.profile.interessen.includes(interest)
				? state.profile.interessen.filter((i) => i !== interest)
				: [...state.profile.interessen, interest];
			return {
				profile: { ...state.profile, interessen: interests },
			};
		}),

	addCustomInterest: (interest) =>
		set((state) => ({
			profile: {
				...state.profile,
				customInteressen: [...state.profile.customInteressen, interest],
				interessen: [...state.profile.interessen, interest],
			},
		})),

	setStrength: (id, value) =>
		set((state) => ({
			profile: {
				...state.profile,
				staerken: { ...state.profile.staerken, [id]: value },
			},
		})),

	setSecretTalent: (value) =>
		set((state) => ({
			profile: { ...state.profile, geheimesTalent: value },
		})),

	setPracticalExperience: (value) =>
		set((state) => ({
			profile: { ...state.profile, praktischeErfahrungen: value },
		})),

	setWorkPreference: (id, choice) =>
		set((state) => ({
			profile: {
				...state.profile,
				arbeitsbedingungen: {
					...state.profile.arbeitsbedingungen,
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
}));
