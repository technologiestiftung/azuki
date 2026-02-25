import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { content } from "../content/de";
import { useAppDispatch } from "../context/AppContext";
import { Step } from "../types";

const slideImages = [
	"/illustrations/communication.svg",
	"/illustrations/craftsmanship.svg",
	"/illustrations/logical-thinking-container.svg",
	"/illustrations/concentration-alt.svg",
];

const AUTO_ADVANCE_MS = 3000;

export function WelcomeCarousel() {
	const [currentSlide, setCurrentSlide] = useState(0);
	const dispatch = useAppDispatch();
	const slides = content.welcome.slides;

	const advanceSlide = useCallback(() => {
		setCurrentSlide((prev) => (prev + 1) % slides.length);
	}, [slides.length]);

	useEffect(() => {
		const timer = setInterval(advanceSlide, AUTO_ADVANCE_MS);
		return () => clearInterval(timer);
	}, [advanceSlide]);

	function handleCta() {
		dispatch({ type: "GO_TO_STEP", step: Step.Start });
	}

	return (
		<div className="flex flex-col min-h-[100dvh]">
			<div className="flex gap-1 px-4 pt-4">
				{slides.map((_, i) => (
					<div
						key={i}
						className="h-1 flex-1 rounded-full transition-colors duration-300"
						style={{
							backgroundColor:
								i <= currentSlide
									? "var(--theme-primary-filled)"
									: "#e5e7eb",
						}}
					/>
				))}
			</div>

			<div className="flex-1 flex flex-col items-center justify-center px-8">
				<AnimatePresence mode="wait">
					<motion.div
						key={currentSlide}
						initial={{ opacity: 0, x: 40 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -40 }}
						transition={{ duration: 0.3 }}
						className="flex flex-col items-center text-center"
					>
						<img
							src={slideImages[currentSlide]}
							alt=""
							className="w-56 h-56 object-contain mb-10"
						/>
						<h1 className="text-h2 font-bold">
							{slides[currentSlide].title}
						</h1>
					</motion.div>
				</AnimatePresence>
			</div>

			<div className="px-4 pb-8">
				<button
					onClick={handleCta}
					className="w-full py-4 rounded-2xl text-subhead font-semibold"
					style={{
						backgroundColor: "var(--theme-primary-filled)",
						color: "var(--theme-on-primary)",
					}}
				>
					{content.welcome.cta}
				</button>
			</div>
		</div>
	);
}
