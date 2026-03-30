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

function App() {
	const location = useLocation();

	return (
		<div className="max-w-[430px] mx-auto h-[100dvh] bg-sky-white relative overflow-hidden">
			<div key={location.pathname} className="animate-fadeIn h-full">
				<Routes>
					<Route path="/" element={<LoginScreen />} />
					<Route path="/welcome" element={<WelcomeCarousel />} />
					<Route path="/start" element={<StartScreen />} />
					<Route path="/education/inschool" element={<InSchoolStep />} />
					<Route path="/education/degree" element={<SchoolDegreeStep />} />
					<Route path="/education/subjects" element={<SchoolSubjectsStep />} />
					<Route path="/interests" element={<InterestsStep />} />
					<Route path="/strengths" element={<StrengthsStep />} />
					<Route path="/secret-talent" element={<SecretTalentStep />} />
					<Route path="/conditions" element={<WorkValuesStep />} />
					<Route path="/experience" element={<PracticalExperienceStep />} />
					<Route path="/expectations" element={<WorkPreferencesStep />} />
					<Route path="/nogos" element={<NoGosStep />} />
					<Route path="/loading" element={<LoadingScreen />} />
					<Route path="/results/list" element={<ResultsPage />} />
					<Route path="*" element={<Navigate to="/welcome" replace />} />
				</Routes>
			</div>
		</div>
	);
}

export default App;
