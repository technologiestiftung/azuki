import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useToastStore } from "./store/useToastStore";
import { useMatchResultsStore } from "./store/useMatchResultsStore";
import { LoginScreen } from "./components/login-screen/LoginScreen";
import { StartScreen } from "./components/competence-profile/start/StartScreen";
import { InSchoolStep } from "./components/competence-profile/steps/InSchoolStep";
import { SchoolDegreeStep } from "./components/competence-profile/steps/school-degree/SchoolDegreeStep";
import { SchoolSubjectsStep } from "./components/competence-profile/steps/school-subject-step/SchoolSubjectsStep";
import { InterestsStep } from "./components/competence-profile/steps/interests-step/InterestsStep";
import { StrengthsStep } from "./components/competence-profile/steps/strengths-step/StrengthsStep";
import { PracticalExperienceStep } from "./components/competence-profile/steps/practical-experience/PracticalExperienceStep";
import { WorkPreferencesStep } from "./components/competence-profile/steps/WorkPreferencesStep";
import { NoGosStep } from "./components/competence-profile/steps/no-gos-step/NoGosStep";
import { ResultsPage } from "./components/results-page/ResultsPage";
import { OccupationDetailPage } from "./components/results-page/occupation-detail/OccupationDetailPage";
import { VacanciesPage } from "./components/results-page/vacancies-page/VacanciesPage";
import { VacanciesDetailPage } from "./components/results-page/vacancy-detail/VacanciesDetailPage";
import { WorkExpectationsStep } from "./components/competence-profile/steps/WorkExpectationsStep";
import { EvalPage } from "./components/eval/EvalPage";
import { PersonasPage } from "./components/personas/PersonasPage";
import { PersonaDetailPage } from "./components/personas/PersonaDetailPage";
import { RequireSession } from "./routing/RequireSession";
import { isVacanciesSectionPath, ROUTE_PATHS } from "./routing/routes";
import { Profile } from "./profile/Profile";
import { AboutPage } from "./components/about-page/about";
import { ContactPage } from "./components/contact-card/ContactPage";
import { PreferredJobsStep } from "./components/competence-profile/steps/PreferredJobsStep";

const LoadingScreen = lazy(() =>
	import("./components/loading-screen/LoadingScreen").then((mod) => ({
		default: mod.LoadingScreen,
	})),
);

function App() {
	const location = useLocation();

	useEffect(() => {
		useToastStore.getState().close();
	}, [location.pathname, location.hash]);

	useEffect(() => {
		const store = useMatchResultsStore.getState();
		if (!isVacanciesSectionPath(location.pathname)) {
			store.clearSystemVacancyOccupationFilter();
		}
	}, [location.pathname]);

	return (
		<div
			className={
				location.pathname === ROUTE_PATHS.eval ||
				location.pathname.startsWith("/personas")
					? "w-full min-h-[100dvh] bg-white relative"
					: "max-w-[430px] mx-auto h-[100dvh] bg-sky-white relative overflow-hidden"
			}
		>
			<div key={location.pathname} className="animate-fadeIn h-full">
				<Routes>
					<Route path={ROUTE_PATHS.login} element={<LoginScreen />} />
					<Route path={ROUTE_PATHS.start} element={<StartScreen />} />
					<Route
						path={ROUTE_PATHS.educationInSchool}
						element={<InSchoolStep />}
					/>
					<Route
						path={ROUTE_PATHS.educationDegree}
						element={<SchoolDegreeStep />}
					/>
					<Route
						path={ROUTE_PATHS.educationSubjects}
						element={<SchoolSubjectsStep />}
					/>
					<Route path={ROUTE_PATHS.interests} element={<InterestsStep />} />
					<Route
						path={ROUTE_PATHS.preferredJob}
						element={<PreferredJobsStep />}
					/>
					<Route path={ROUTE_PATHS.strengths} element={<StrengthsStep />} />
					<Route
						path={ROUTE_PATHS.expectations}
						element={<WorkExpectationsStep />}
					/>
					<Route
						path={ROUTE_PATHS.experience}
						element={<PracticalExperienceStep />}
					/>
					<Route
						path={ROUTE_PATHS.preferences}
						element={<WorkPreferencesStep />}
					/>
					<Route path={ROUTE_PATHS.nogos} element={<NoGosStep />} />
					<Route
						path={ROUTE_PATHS.loading}
						element={
							<Suspense fallback={null}>
								<LoadingScreen />
							</Suspense>
						}
					/>
					<Route
						path={ROUTE_PATHS.resultsList}
						element={
							<RequireSession requireMatchResults>
								<ResultsPage />
							</RequireSession>
						}
					/>
					<Route
						path={ROUTE_PATHS.resultsVacancies}
						element={
							<RequireSession requireMatchResults>
								<VacanciesPage />
							</RequireSession>
						}
					/>
					<Route
						path={ROUTE_PATHS.resultsOccupationDetail}
						element={
							<RequireSession requireMatchResults>
								<OccupationDetailPage />
							</RequireSession>
						}
					/>
					<Route
						path={ROUTE_PATHS.resultsVacancyDetail}
						element={<VacanciesDetailPage />}
					/>
					<Route path={ROUTE_PATHS.eval} element={<EvalPage />} />
					<Route path={ROUTE_PATHS.personas} element={<PersonasPage />} />
					<Route
						path={ROUTE_PATHS.personaDetail}
						element={<PersonaDetailPage />}
					/>
					<Route
						path={ROUTE_PATHS.profile}
						element={
							<RequireSession requireProfile>
								<Profile />
							</RequireSession>
						}
					/>
					<Route path={ROUTE_PATHS.about} element={<AboutPage />} />
					<Route path={ROUTE_PATHS.contact} element={<ContactPage />} />
					<Route
						path="*"
						element={<Navigate to={ROUTE_PATHS.start} replace />}
					/>
				</Routes>
			</div>
		</div>
	);
}

export default App;
