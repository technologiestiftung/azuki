import { AnimatePresence, motion } from "framer-motion";
import { useAppStore } from "./store/useAppStore";
import { Step } from "./common";
import { LoginScreen } from "./components/login-screen/LoginScreen";
import { WelcomeCarousel } from "./components/welcome-screen/WelcomeCarousel";
import { StartScreen } from "./components/competence-profile/start/StartScreen";
import { InSchoolStep } from "./components/competence-profile/steps/InSchoolStep";
import { SchoolDegreeStep } from "./components/competence-profile/steps/SchoolDegreeStep";
import { SchoolSubjectsStep } from "./components/competence-profile/steps/SchoolSubjectsStep";
import { InterestsStep } from "./components/competence-profile/steps/InterestsStep";
import { StrengthsStep } from "./components/competence-profile/steps/StrengthsStep";
import { SecretTalentStep } from "./components/competence-profile/steps/SecretTalentStep";
import { PracticalExperienceStep } from "./components/competence-profile/steps/PracticalExperienceStep";
import { WorkPreferencesStep } from "./components/competence-profile/steps/WorkPreferencesStep";
import { NoGosStep } from "./components/competence-profile/steps/NoGosStep";
import { LoadingScreen } from "./components/loading-screen/LoadingScreen";
import { ResultsScreen } from "./components/result-screen/ResultsScreen";

function StepRenderer() {
	const currentStep = useAppStore((state) => state.currentStep);

	switch (currentStep) {
		case Step.Login:
			return <LoginScreen />;
		case Step.Welcome:
			return <WelcomeCarousel />;
		case Step.Start:
			return <StartScreen />;
		case Step.InSchool:
			return <InSchoolStep />;
		case Step.SchoolDegreeStep:
			return <SchoolDegreeStep />;
		case Step.SchoolSubjects:
			return <SchoolSubjectsStep />;
		case Step.Interests:
			return <InterestsStep />;
		case Step.Strengths:
			return <StrengthsStep />;
		case Step.SecretTalent:
			return <SecretTalentStep />;
		case Step.PracticalExperience:
			return <PracticalExperienceStep />;
		case Step.WorkPreferences:
			return <WorkPreferencesStep />;
		case Step.NoGos:
			return <NoGosStep />;
		case Step.Loading:
			return <LoadingScreen />;
		case Step.Results:
			return <ResultsScreen />;
		default:
			return null;
	}
}

function App() {
	const currentStep = useAppStore((state) => state.currentStep);

	return (
		<div className="max-w-[430px] mx-auto min-h-[100dvh] bg-white relative overflow-hidden">
			<AnimatePresence mode="wait">
				<motion.div
					key={currentStep}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.2 }}
				>
					<StepRenderer />
				</motion.div>
			</AnimatePresence>
		</div>
	);
}

export default App;
