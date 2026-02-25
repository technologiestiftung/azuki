import { AnimatePresence, motion } from "framer-motion";
import { useAppState } from "./context/AppContext";
import { Step } from "./types";
import { LoginScreen } from "./components/LoginScreen";
import { WelcomeCarousel } from "./components/WelcomeCarousel";
import { StartScreen } from "./components/StartScreen";
import { InSchoolStep } from "./components/InSchoolStep";
import { SchoolDegreeStep } from "./components/SchoolDegreeStep";
import { SchoolSubjectsStep } from "./components/SchoolSubjectsStep";
import { InterestsStep } from "./components/InterestsStep";
import { StrengthsStep } from "./components/StrengthsStep";
import { SecretTalentStep } from "./components/SecretTalentStep";
import { PracticalExperienceStep } from "./components/PracticalExperienceStep";
import { WorkPreferencesStep } from "./components/WorkPreferencesStep";
import { NoGosStep } from "./components/NoGosStep";
import { LoadingScreen } from "./components/LoadingScreen";
import { ResultsScreen } from "./components/ResultsScreen";

function StepRenderer() {
	const { currentStep } = useAppState();

	switch (currentStep) {
		case Step.Login:
			return <LoginScreen />;
		case Step.Welcome:
			return <WelcomeCarousel />;
		case Step.Start:
			return <StartScreen />;
		case Step.InSchool:
			return <InSchoolStep />;
		case Step.SchoolDegree:
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
	const { currentStep } = useAppState();

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
