import { Svg, Circle, Line, Path } from "@react-pdf/renderer";
import { COLOR } from "./pdfTheme";

interface PdfFitDonutChartProps {
	percent: number;
	size?: number;
	strokeWidth?: number;
}

const CAP_BORDER_RATIO = 2 / 24;

function polarToCartesian(
	center: number,
	radius: number,
	angleInDegrees: number,
): { x: number; y: number } {
	const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
	return {
		x: center + radius * Math.cos(angleInRadians),
		y: center + radius * Math.sin(angleInRadians),
	};
}

function describeArc({
	center,
	radius,
	startAngle,
	endAngle,
}: {
	center: number;
	radius: number;
	startAngle: number;
	endAngle: number;
}): string {
	const start = polarToCartesian(center, radius, endAngle);
	const end = polarToCartesian(center, radius, startAngle);
	const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

	return [
		"M",
		start.x,
		start.y,
		"A",
		radius,
		radius,
		0,
		largeArcFlag,
		0,
		end.x,
		end.y,
	].join(" ");
}

export function PdfFitDonutChart({
	percent,
	size = 72,
	strokeWidth = 14,
}: PdfFitDonutChartProps) {
	const center = size / 2;
	const radius = (size - strokeWidth) / 2;
	const clampedPercent = Math.min(100, Math.max(0, percent));

	const sweepDegrees = (clampedPercent / 100) * 360;

	let progressPath = "";
	if (clampedPercent >= 100) {
		progressPath = describeArc({
			center,
			radius,
			startAngle: 0,
			endAngle: 359.99,
		});
	} else if (sweepDegrees > 0) {
		progressPath = describeArc({
			center,
			radius,
			startAngle: 0,
			endAngle: sweepDegrees,
		});
	}

	const showCapBorder = clampedPercent > 0 && clampedPercent < 100;
	const cutOuterRadius = radius + strokeWidth / 2 + 0.5;
	const cutInnerRadius = radius - strokeWidth / 2 - 0.5;
	const cuts = showCapBorder
		? [0, sweepDegrees].map((angle) => ({
				angle,
				outer: polarToCartesian(center, cutOuterRadius, angle),
				inner: polarToCartesian(center, cutInnerRadius, angle),
			}))
		: [];

	return (
		<Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
			<Circle
				cx={center}
				cy={center}
				r={radius}
				stroke={COLOR.orange400}
				strokeWidth={strokeWidth}
				fill="none"
			/>
			{progressPath ? (
				<Path
					d={progressPath}
					stroke={COLOR.sky300}
					strokeWidth={strokeWidth}
					fill="none"
					strokeLinecap="butt"
				/>
			) : null}
			{cuts.map((cut) => (
				<Line
					key={cut.angle}
					x1={cut.outer.x}
					y1={cut.outer.y}
					x2={cut.inner.x}
					y2={cut.inner.y}
					stroke={COLOR.sky50}
					strokeWidth={strokeWidth * CAP_BORDER_RATIO}
				/>
			))}
		</Svg>
	);
}
