import { content } from "../content/de";
import { useAppDispatch } from "../context/AppContext";
import { Step } from "../types";

export function StartScreen() {
	const dispatch = useAppDispatch();

	return (
		<div className="flex flex-col min-h-[100dvh]">
			<div className="px-4 pt-4">
				<button
					onClick={() => dispatch({ type: "GO_TO_STEP", step: Step.Welcome })}
					className="w-10 h-10 flex items-center justify-center rounded-full"
					aria-label={content.navigation.back}
				>
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
						<path d="M19 12H5M12 19l-7-7 7-7" />
					</svg>
				</button>
			</div>

			<div className="flex-1 flex flex-col items-center justify-center px-8">
				<img
					src="/illustrations/star.svg"
					alt=""
					className="w-64 h-64 object-contain mb-8"
				/>
			</div>

			<div className="px-4 pb-4">
				<h1 className="text-h2 font-bold mb-3">
					{content.start.heading}
				</h1>
				<p className="text-body text-gray-600 mb-8">
					{content.start.body}
				</p>
			</div>

			<div className="px-4 pb-8">
				<button
					onClick={() => dispatch({ type: "NEXT_STEP" })}
					className="w-full py-4 rounded-2xl text-subhead font-semibold"
					style={{
						backgroundColor: "var(--theme-primary-filled)",
						color: "var(--theme-on-primary)",
					}}
				>
					{content.start.cta}
				</button>
			</div>
		</div>
	);
}
