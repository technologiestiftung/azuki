import { content } from "../../content";
import { GhostIconButton } from "../primitives/buttons/GhostIconButton";

interface ContactCardHeaderProps {
	submitted: boolean;
	collapsed: boolean;
	titleRevealProgress: number;
	titleAlign?: "center" | "left";
	onDismiss?: () => void;
	dismissIconSrc?: string;
	dismissAriaLabel?: string;
}

export function ContactCardHeader({
	submitted,
	collapsed,
	titleRevealProgress,
	titleAlign = "center",
	onDismiss,
	dismissIconSrc,
	dismissAriaLabel,
}: ContactCardHeaderProps) {
	return (
		<div
			className={`relative flex min-h-[52px] items-center px-4 py-2 ${
				submitted ? "justify-end" : ""
			}`}
		>
			<div
				className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-sky-shade-20 transition-opacity duration-150"
				style={{ opacity: collapsed && !submitted ? 1 : 0 }}
				aria-hidden
			/>
			{onDismiss &&
				(submitted ? (
					<button
						type="button"
						className="relative z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-sky-shade-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
						onClick={onDismiss}
						aria-label={dismissAriaLabel}
					>
						<img src="/icons/close-gray.svg" alt="" className="h-6 w-6" />
					</button>
				) : (
					<GhostIconButton
						className="relative z-10"
						onClick={onDismiss}
						ariaLabel={dismissAriaLabel}
						iconSrc={dismissIconSrc}
					/>
				))}
			{!submitted && (
				<div
					className={`pointer-events-none absolute inset-x-0 truncate text-lg font-semibold text-sky-900 transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.25,0,0.25,1)] ${
						titleAlign === "left" ? "px-4 text-left" : "px-12 text-center"
					}`}
					style={{
						opacity: titleRevealProgress,
						transform: `translateY(${(1 - titleRevealProgress) * 8}px)`,
					}}
					aria-hidden
				>
					{content["results.contactCard.bottomSheet.title"]}
				</div>
			)}
		</div>
	);
}
