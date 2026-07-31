import type { Ref } from "react";
import { content } from "../../content";
import { GhostIconButton } from "../primitives/buttons/GhostIconButton";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../routing/routes";

interface AboutHeaderCollapsedProps {
	collapseProgress: number;
	titleSlotRef: Ref<HTMLDivElement>;
}

export function AboutHeaderCollapsed({
	collapseProgress,
	titleSlotRef,
}: AboutHeaderCollapsedProps) {
	const navigate = useNavigate();

	return (
		<div
			className="absolute top-0 inset-x-0 z-30 bg-white transition-opacity duration-150"
			style={{
				opacity: collapseProgress,
				pointerEvents: collapseProgress < 0.5 ? "none" : "auto",
			}}
			aria-hidden={collapseProgress < 0.5}
		>
			<div className="flex w-full items-center gap-1.5 px-4 pt-2 pb-2 shrink-0 border-b border-sky-shade-20">
				<GhostIconButton
					iconSrc="/icons/arrow-back-black.svg"
					iconSize="w-5 h-5"
					ariaLabel={content["about.backButton.ariaLabel"]}
					onClick={() => navigate(ROUTE_PATHS.profile)}
					className="transition-opacity duration-150"
				/>
				{/* Invisible slot for morph target; visible title lives in AboutPage */}
				<div
					ref={titleSlotRef}
					className="text-sm font-semibold leading-5 text-gray-900 flex-1 text-left truncate opacity-0"
					aria-hidden
				>
					{content["about.title"]}
				</div>
			</div>
		</div>
	);
}
