import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
	type UserProfile,
	type EducationLevel,
	type WorkPreferenceChoice,
	type NoGoAnswer,
	type PracticalExperienceInput,
	type VacanciesResponse,
} from "../common";
import { initialUserProfile } from "../profile/initialUserProfile";
import {
	dedupePreferredJobs,
	isDuplicatePreferredJob,
} from "../profile/preferredJobUtils";
import { useMatchResultsStore } from "./useMatchResultsStore";

export interface Location {
	postcode: string;
	distance: number;
	locality?: string | null;
}

export const DEFAULT_LOCATION: Location = { postcode: "10115", distance: 25 };

/** Normalizes the profile by merging the initial profile with the provided profile. */
function normalizeProfile(
	profile: Partial<UserProfile> | undefined,
): UserProfile {
	const merged = { ...initialUserProfile, ...profile };
	const practicalExperiences =
		merged.practicalExperiences ?? initialUserProfile.practicalExperiences;
	const selectedPracticalExperienceIds =
		merged.selectedPracticalExperienceIds ??
		practicalExperiences.map((entry) => entry.id);

	return {
		...merged,
		favoriteSubjects: merged.favoriteSubjects ?? [],
		customSubjects: merged.customSubjects ?? [],
		interests: merged.interests ?? [],
		preferredJobs: dedupePreferredJobs(merged.preferredJobs ?? []),
		customInterests: merged.customInterests ?? [],
		workExpectations: merged.workExpectations ?? [],
		customWorkExpectations: merged.customWorkExpectations ?? [],
		strengths: merged.strengths ?? {},
		customStrengths: merged.customStrengths ?? [],
		selectedCustomStrengths: merged.selectedCustomStrengths ?? [],
		practicalExperiences,
		selectedPracticalExperienceIds,
		workPreferences: merged.workPreferences ?? {},
		noGos: merged.noGos ?? {},
		customNoGos: merged.customNoGos ?? [],
	};
}

// Clears anything derived from the user's profile or matched berufe.
// `useMatchResultsStore` lives in a separate store; `vacancies` is keyed to
// the previous match results, so it must be invalidated together.
function clearMatchResults(): void {
	useMatchResultsStore.getState().clearMatchResults();
	useAppStore.setState({
		vacancies: null,
		vacanciesFetchError: null,
	});
}

interface AppState {
	profile: UserProfile;
	vacancies: VacanciesResponse | null;
	vacanciesFetchError: string | null;
	location: Location;
}

interface AppActions {
	setInSchool: (value: boolean) => void;
	setEducationLevel: (value: EducationLevel) => void;
	toggleSubject: (subject: string) => void;
	toggleWorkExpectation: (value: string) => void;
	toggleInterest: (interest: string) => void;
	addCustomInterest: (interest: string) => void;
	removeCustomInterest: (interest: string) => void;
	addPreferredJobs: (preferredJobs: string[]) => void;
	togglePreferredJob: (preferredJob: string) => void;
	removePreferredJob: (preferredJob: string) => void;
	addCustomSubject: (subject: string) => void;
	removeCustomSubject: (subject: string) => void;
	addCustomWorkExpectation: (workExpectation: string) => void;
	addCustomStrength: (strength: string) => void;
	toggleCustomStrength: (strength: string) => void;
	removeCustomStrength: (strength: string) => void;
	setStrength: (id: string, value: number) => void;
	addPracticalExperience: (entry: PracticalExperienceInput) => void;
	togglePracticalExperience: (id: string) => void;
	removePracticalExperience: (id: string) => void;
	setWorkPreference: (id: string, choice: WorkPreferenceChoice | null) => void;
	setNoGo: (id: string, answer: NoGoAnswer | null) => void;
	addCustomNoGo: (noGo: string) => void;
	toggleCustomNoGo: (noGo: string) => void;
	removeCustomNoGo: (noGo: string) => void;
	setVacancies: (results: VacanciesResponse | null) => void;
	setVacanciesFetchError: (error: string | null) => void;
	setLocation: (location: Partial<Location>) => void;
	resetProfile: () => void;
}

export const useAppStore = create<AppState & AppActions>()(
	persist(
		(set) => ({
			profile: initialUserProfile,
			vacancies: null,
			vacanciesFetchError: null,
			location: DEFAULT_LOCATION,

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
			removeCustomSubject: (subject) =>
				set((state) => {
					const favoriteSubjects = state.profile.favoriteSubjects.filter(
						(favoriteSubject: string) => favoriteSubject !== subject,
					);
					const customSubjects = (state.profile.customSubjects ?? []).filter(
						(customSubject: string) => customSubject !== subject,
					);
					clearMatchResults();
					return {
						profile: { ...state.profile, favoriteSubjects, customSubjects },
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
			addPreferredJobs: (preferredJobs) => {
				clearMatchResults();
				set((state) => {
					const merged = [...state.profile.preferredJobs];
					for (const preferredJob of preferredJobs) {
						const trimmed = preferredJob.trim();
						if (!trimmed || isDuplicatePreferredJob(merged, trimmed)) {
							continue;
						}
						merged.push(trimmed);
					}
					if (merged.length === state.profile.preferredJobs.length) {
						return state;
					}
					return {
						profile: {
							...state.profile,
							preferredJobs: merged,
						},
					};
				});
			},
			togglePreferredJob: (preferredJob) => {
				clearMatchResults();
				set((state) => {
					const currentPreferredJobs = state.profile.preferredJobs ?? [];
					const preferredJobs = currentPreferredJobs.includes(preferredJob)
						? currentPreferredJobs.filter((job) => job !== preferredJob)
						: [...currentPreferredJobs, preferredJob];
					return {
						profile: { ...state.profile, preferredJobs },
					};
				});
			},

			removePreferredJob: (preferredJob) => {
				clearMatchResults();
				set((state) => {
					const preferredJobs = (state.profile.preferredJobs ?? []).filter(
						(job) => job !== preferredJob,
					);
					return {
						profile: { ...state.profile, preferredJobs },
					};
				});
			},

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

			removeCustomInterest: (interest) =>
				set((state) => {
					const interests = state.profile.interests.filter(
						(value: string) => value !== interest,
					);
					const customInterests = state.profile.customInterests.filter(
						(value: string) => value !== interest,
					);
					clearMatchResults();
					return {
						profile: { ...state.profile, interests, customInterests },
					};
				}),

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

			removeCustomStrength: (strength) => {
				clearMatchResults();
				set((state) => {
					const customStrengths = state.profile.customStrengths.filter(
						(value) => value !== strength,
					);
					const selectedCustomStrengths =
						state.profile.selectedCustomStrengths.filter(
							(value) => value !== strength,
						);
					return {
						profile: {
							...state.profile,
							customStrengths,
							selectedCustomStrengths,
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

			addPracticalExperience: (entry) => {
				clearMatchResults();
				set((state) => {
					const id = crypto.randomUUID();
					return {
						profile: {
							...state.profile,
							practicalExperiences: [
								...state.profile.practicalExperiences,
								{ ...entry, id },
							],
							selectedPracticalExperienceIds: [
								...state.profile.selectedPracticalExperienceIds,
								id,
							],
						},
					};
				});
			},

			togglePracticalExperience: (id) => {
				clearMatchResults();
				set((state) => {
					const selected =
						state.profile.selectedPracticalExperienceIds.includes(id)
							? state.profile.selectedPracticalExperienceIds.filter(
									(entryId) => entryId !== id,
								)
							: [...state.profile.selectedPracticalExperienceIds, id];
					return {
						profile: {
							...state.profile,
							selectedPracticalExperienceIds: selected,
						},
					};
				});
			},

			removePracticalExperience: (id) => {
				clearMatchResults();
				set((state) => {
					const practicalExperiences =
						state.profile.practicalExperiences.filter(
							(entry) => entry.id !== id,
						);
					const selectedPracticalExperienceIds =
						state.profile.selectedPracticalExperienceIds.filter(
							(entryId) => entryId !== id,
						);
					return {
						profile: {
							...state.profile,
							practicalExperiences,
							selectedPracticalExperienceIds,
						},
					};
				});
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

			addCustomNoGo: (noGo) => {
				clearMatchResults();
				set((state) => {
					if (state.profile.customNoGos.includes(noGo)) {
						return state;
					}
					return {
						profile: {
							...state.profile,
							customNoGos: [...state.profile.customNoGos, noGo],
							noGos: { ...state.profile.noGos, [noGo]: "rejected" },
						},
					};
				});
			},

			toggleCustomNoGo: (noGo) => {
				clearMatchResults();
				set((state) => {
					const current = state.profile.noGos[noGo];
					const next: NoGoAnswer =
						current === "rejected" ? "accepted" : "rejected";
					return {
						profile: {
							...state.profile,
							noGos: { ...state.profile.noGos, [noGo]: next },
						},
					};
				});
			},

			removeCustomNoGo: (noGo) => {
				clearMatchResults();
				set((state) => {
					const customNoGos = state.profile.customNoGos.filter(
						(value) => value !== noGo,
					);
					const noGos = { ...state.profile.noGos, [noGo]: null };
					return {
						profile: { ...state.profile, customNoGos, noGos },
					};
				});
			},

			setVacancies: (results) => {
				set({
					vacancies: results,
					vacanciesFetchError: null,
				});
				useMatchResultsStore.getState().syncVacanciesCount(results);
			},

			setVacanciesFetchError: (error) => set({ vacanciesFetchError: error }),

			setLocation: (location) => {
				set((state) => ({
					location: { ...state.location, ...location },
					// Changing location invalidates per-beruf counts since they
					// were fetched for the previous location.
					vacancies: null,
					vacanciesFetchError: null,
				}));
				useMatchResultsStore.getState().syncVacanciesCount(null);
			},

			resetProfile: () => {
				clearMatchResults();
				// location is a user preference, not derived from profile —
				// keep it across resets.
				set({ profile: initialUserProfile });
			},
		}),
		{
			name: "azuki-app-store",
			storage: createJSONStorage(() => sessionStorage),
			partialize: (state) => ({
				profile: state.profile,
				location: state.location,
			}),
			merge: (persistedState, currentState) => {
				const persisted = persistedState as
					| (Partial<AppState> & {
							standort?: { plz: string; umkreis: number };
					  })
					| undefined;
				const legacyStandort = persisted?.standort;
				const location =
					persisted?.location ??
					(legacyStandort
						? {
								postcode: legacyStandort.plz,
								distance: legacyStandort.umkreis,
							}
						: currentState.location);
				return {
					...currentState,
					...(persisted ?? {}),
					location,
					profile: normalizeProfile(persisted?.profile),
				};
			},
		},
	),
);
