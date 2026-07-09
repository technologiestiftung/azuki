import { useEffect, useRef, useState } from "react";

interface FitDonutChartProps {
	percent: number;
	size?: number;
	strokeWidth?: number;
	className?: string;
}

export function FitDonutChart({
	percent,
	size = 102,
	strokeWidth = 24,
	className = "",
}: FitDonutChartProps) {
	const [animatedPercent, setAnimatedPercent] = useState(0);
	const hasAnimatedRef = useRef(false);
	const svgRef = useRef<SVGSVGElement>(null);

	useEffect(() => {
		const element = svgRef.current;
		if (!element) {
			return undefined;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting || hasAnimatedRef.current) {
					return;
				}

				hasAnimatedRef.current = true;
				observer.disconnect();
				requestAnimationFrame(() => {
					setAnimatedPercent(percent);
				});
			},
			{ threshold: 0.25 },
		);

		observer.observe(element);
		return () => observer.disconnect();
	}, [percent]);

	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	const clampedPercent = Math.min(100, Math.max(0, animatedPercent));
	const progressLength = Math.max(
		0,
		(clampedPercent / 100) * circumference - strokeWidth,
	);
	const strokeDashoffset = circumference - progressLength;
	const center = size / 2;

	return (
		<svg
			ref={svgRef}
			width={size}
			height={size}
			viewBox={`0 0 ${size} ${size}`}
			className={className}
			aria-hidden
		>
			<circle
				cx={center}
				cy={center}
				r={radius}
				fill="none"
				className="stroke-sky-100"
				strokeWidth={strokeWidth}
			/>
			<circle
				cx={center}
				cy={center}
				r={radius}
				fill="none"
				className="stroke-sky-300 transition-[stroke-dashoffset] duration-[2000ms] ease-out"
				strokeWidth={strokeWidth}
				strokeLinecap="round"
				strokeDasharray={circumference}
				strokeDashoffset={strokeDashoffset}
				transform={`rotate(-90 ${center} ${center})`}
			/>
		</svg>
	);
}
