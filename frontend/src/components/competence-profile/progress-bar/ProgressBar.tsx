import { useEffect, useState } from "react";

interface ProgressBarProps {
	progress: number;
}

/* saving the progress to avoid non smooth transitions */
let lastProgress = 0;

export function ProgressBar({ progress }: ProgressBarProps) {
	const [displayedProgress, setDisplayedProgress] = useState(lastProgress);

	useEffect(() => {
		lastProgress = progress;
		setDisplayedProgress(progress);
	}, [progress]);

	return (
		<div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
			<div
				className="h-full bg-sky-300 rounded-full transition-all duration-500 ease-out"
				style={{
					width: `${displayedProgress * 100}%`,
				}}
			/>
		</div>
	);
}
