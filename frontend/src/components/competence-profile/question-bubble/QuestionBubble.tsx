interface QuestionBubbleProps {
	question: string;
	subtitle?: string;
}

export function QuestionBubble({ question, subtitle }: QuestionBubbleProps) {
	return (
		<div className="w-full pt-9 bg-gradient-to-b from-sky-white from-50% to-transparent">
			<div className="relative w-full">
				<div className="relative w-full">
					<div aria-hidden="true" className="absolute inset-0 z-[1]">
						<img
							src="/illustrations/question-bubble-outline.svg"
							alt=""
							className="w-full h-full"
						/>
						<div
							className="absolute -top-[41px] left-1 shrink-0"
							aria-hidden="true"
						>
							<div className="relative">
								<img
									src="/illustrations/question-bubble-star.svg"
									alt=""
									className="relative z-0 max-w-none shrink-0"
								/>
								<img
									src="/illustrations/eyes.svg"
									alt=""
									className="absolute top-[22px] left-6 z-10 max-w-none shrink-0"
								/>
							</div>
						</div>
					</div>
					<div className="relative flex items-center p-3 z-10">
						<div className="flex flex-col gap-2">
							<h2 className="text-3xl font-bold text-sky-1000">{question}</h2>
							{subtitle && (
								<p className="text-base text-sky-700 mt-1">{subtitle}</p>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
