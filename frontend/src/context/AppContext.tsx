import {
	createContext,
	useContext,
	useReducer,
	type ReactNode,
	type Dispatch,
} from "react";
import {
	Step,
	type UserProfile,
	type SchoolDegree,
	type WorkPreferenceChoice,
	type NoGoAnswer,
	type MatchResult,
} from "../types";

interface AppState {
	currentStep: Step;
	profile: UserProfile;
	matchResults: MatchResult | null;
	matchError: boolean;
	strengthSubIndex: number;
	noGoSubIndex: number;
	workPrefSubIndex: number;
}

type Action =
	| { type: "GO_TO_STEP"; step: Step }
	| { type: "NEXT_STEP" }
	| { type: "PREV_STEP" }
	| { type: "SET_SCHOOL_DEGREE"; value: SchoolDegree }
	| { type: "TOGGLE_SUBJECT"; subject: string }
	| { type: "TOGGLE_INTEREST"; interest: string }
	| { type: "ADD_CUSTOM_INTEREST"; interest: string }
	| { type: "SET_STRENGTH"; id: string; value: number }
	| { type: "SET_SECRET_TALENT"; value: string }
	| { type: "SET_PRACTICAL_EXPERIENCE"; value: string }
	| { type: "SET_WORK_PREFERENCE"; id: string; choice: WorkPreferenceChoice }
	| { type: "SET_NOGO"; id: string; answer: NoGoAnswer }
	| { type: "SET_MATCH_RESULTS"; results: MatchResult }
	| { type: "SET_MATCH_ERROR"; value: boolean }
	| { type: "SET_STRENGTH_SUB_INDEX"; index: number }
	| { type: "SET_NOGO_SUB_INDEX"; index: number }
	| { type: "SET_WORK_PREF_SUB_INDEX"; index: number };

const STEP_ORDER = [
	Step.Login,
	Step.Welcome,
	Step.Start,
	Step.InSchool,
	Step.SchoolDegree,
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

const initialState: AppState = {
	currentStep: Step.Login,
	profile: initialProfile,
	matchResults: null,
	matchError: false,
	strengthSubIndex: 0,
	noGoSubIndex: 0,
	workPrefSubIndex: 0,
};

function reducer(state: AppState, action: Action): AppState {
	switch (action.type) {
		case "GO_TO_STEP":
			return { ...state, currentStep: action.step };

		case "NEXT_STEP": {
			const idx = STEP_ORDER.indexOf(state.currentStep);
			if (idx < STEP_ORDER.length - 1) {
				return { ...state, currentStep: STEP_ORDER[idx + 1] };
			}
			return state;
		}

		case "PREV_STEP": {
			const idx = STEP_ORDER.indexOf(state.currentStep);
			if (idx > 0) {
				return { ...state, currentStep: STEP_ORDER[idx - 1] };
			}
			return state;
		}

		case "SET_SCHOOL_DEGREE":
			return {
				...state,
				profile: { ...state.profile, schulabschluss: action.value },
			};

		case "TOGGLE_SUBJECT": {
			const subjects = state.profile.lieblingsfaecher.includes(action.subject)
				? state.profile.lieblingsfaecher.filter((s) => s !== action.subject)
				: [...state.profile.lieblingsfaecher, action.subject];
			return {
				...state,
				profile: { ...state.profile, lieblingsfaecher: subjects },
			};
		}

		case "TOGGLE_INTEREST": {
			const interests = state.profile.interessen.includes(action.interest)
				? state.profile.interessen.filter((i) => i !== action.interest)
				: [...state.profile.interessen, action.interest];
			return {
				...state,
				profile: { ...state.profile, interessen: interests },
			};
		}

		case "ADD_CUSTOM_INTEREST":
			return {
				...state,
				profile: {
					...state.profile,
					customInteressen: [...state.profile.customInteressen, action.interest],
					interessen: [...state.profile.interessen, action.interest],
				},
			};

		case "SET_STRENGTH":
			return {
				...state,
				profile: {
					...state.profile,
					staerken: { ...state.profile.staerken, [action.id]: action.value },
				},
			};

		case "SET_SECRET_TALENT":
			return {
				...state,
				profile: { ...state.profile, geheimesTalent: action.value },
			};

		case "SET_PRACTICAL_EXPERIENCE":
			return {
				...state,
				profile: { ...state.profile, praktischeErfahrungen: action.value },
			};

		case "SET_WORK_PREFERENCE":
			return {
				...state,
				profile: {
					...state.profile,
					arbeitsbedingungen: {
						...state.profile.arbeitsbedingungen,
						[action.id]: action.choice,
					},
				},
			};

		case "SET_NOGO":
			return {
				...state,
				profile: {
					...state.profile,
					noGos: { ...state.profile.noGos, [action.id]: action.answer },
				},
			};

		case "SET_MATCH_RESULTS":
			return { ...state, matchResults: action.results, matchError: false };

		case "SET_MATCH_ERROR":
			return { ...state, matchError: action.value };

		case "SET_STRENGTH_SUB_INDEX":
			return { ...state, strengthSubIndex: action.index };

		case "SET_NOGO_SUB_INDEX":
			return { ...state, noGoSubIndex: action.index };

		case "SET_WORK_PREF_SUB_INDEX":
			return { ...state, workPrefSubIndex: action.index };

		default:
			return state;
	}
}

const AppContext = createContext<AppState>(initialState);
const DispatchContext = createContext<Dispatch<Action>>(() => {});

export function AppProvider({ children }: { children: ReactNode }) {
	const [state, dispatch] = useReducer(reducer, initialState);

	return (
		<AppContext.Provider value={state}>
			<DispatchContext.Provider value={dispatch}>
				{children}
			</DispatchContext.Provider>
		</AppContext.Provider>
	);
}

export function useAppState() {
	return useContext(AppContext);
}

export function useAppDispatch() {
	return useContext(DispatchContext);
}
