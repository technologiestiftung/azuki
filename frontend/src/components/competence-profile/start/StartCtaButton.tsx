import { PrimaryThemedButton } from "../../primitives/buttons/PrimaryThemedButton";

interface StartCtaButtonProps {
	activeCta: string;
	previousCta: string | null;
	direction: "next" | "prev" | null;
	onClick: () => void;
}

export function StartCtaButton({
	activeCta,
	previousCta,
	direction,
	onClick,
}: StartCtaButtonProps) {
	let labels = [activeCta];
	let animationClass = "";

	if (previousCta && direction === "next") {
		labels = [previousCta, activeCta];
		animationClass = "animate-slideInUp";
	} else if (previousCta && direction === "prev") {
		labels = [activeCta, previousCta];
		animationClass = "animate-slideInDown";
	}

	return (
		<PrimaryThemedButton onClick={onClick} className="w-full overflow-hidden">
			<span className="relative block h-12 w-full overflow-hidden">
				<span
					key={`${activeCta}-${direction ?? "idle"}`}
					className={`flex flex-col gap-2 ${animationClass}`}
				>
					{labels.map((label) => (
						<span
							key={label}
							className="flex h-12 shrink-0 items-center justify-center"
						>
							{label}
						</span>
					))}
				</span>
			</span>
		</PrimaryThemedButton>
	);
}
