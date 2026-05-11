import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { LoginScreen } from "./components/login-screen/LoginScreen";
import { WelcomeCarousel } from "./components/welcome-screen/WelcomeCarousel";
import { StartScreen } from "./components/competence-profile/start/StartScreen";
import { InSchoolStep } from "./components/competence-profile/steps/InSchoolStep";
import { SchoolDegreeStep } from "./components/competence-profile/steps/school-degree/SchoolDegreeStep";
import { SchoolSubjectsStep } from "./components/competence-profile/steps/school-subject-step/SchoolSubjectsStep";
import { InterestsStep } from "./components/competence-profile/steps/interests-step/InterestsStep";
import { StrengthsStep } from "./components/competence-profile/steps/strengths-step/StrengthsStep";
import { SecretTalentStep } from "./components/competence-profile/steps/SecretTalentStep";
import { PracticalExperienceStep } from "./components/competence-profile/steps/PracticalExperienceStep";
import { WorkPreferencesStep } from "./components/competence-profile/steps/WorkPreferencesStep";
import { NoGosStep } from "./components/competence-profile/steps/no-gos-step/NoGosStep";
import { LoadingScreen } from "./components/loading-screen/LoadingScreen";
import { ResultsPage } from "./components/results-page/ResultsPage";
import { WorkValuesStep } from "./components/competence-profile/steps/WorkValuesStep";
import { ROUTE_PATHS } from "./routing/routes";

function App() {
	const location = useLocation();

	return (
		<div className="max-w-[430px] mx-auto h-[100dvh] bg-sky-white relative overflow-hidden">
			<div key={location.pathname} className="animate-fadeIn h-full">
				<Routes>
					<Route path={ROUTE_PATHS.login} element={<LoginScreen />} />
					<Route path={ROUTE_PATHS.welcome} element={<WelcomeCarousel />} />
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
					<Route path={ROUTE_PATHS.strengths} element={<StrengthsStep />} />
					<Route
						path={ROUTE_PATHS.secretTalent}
						element={<SecretTalentStep />}
					/>
					<Route path={ROUTE_PATHS.conditions} element={<WorkValuesStep />} />
					<Route
						path={ROUTE_PATHS.experience}
						element={<PracticalExperienceStep />}
					/>
					<Route
						path={ROUTE_PATHS.preferences}
						element={<WorkPreferencesStep />}
					/>
					<Route path={ROUTE_PATHS.nogos} element={<NoGosStep />} />
					<Route path={ROUTE_PATHS.loading} element={<LoadingScreen />} />
					<Route path={ROUTE_PATHS.resultsList} element={<ResultsPage />} />
					<Route
						path="*"
						element={<Navigate to={ROUTE_PATHS.welcome} replace />}
					/>
				</Routes>
			</div>
		</div>
	);
}

export default App;
