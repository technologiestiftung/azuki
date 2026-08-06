import type { RefObject } from "react";
import { content } from "../content";
import { ProfileActionButtons } from "./ProfileActionButtons";

interface ProfileHeaderCollapsedProps {
	collapseProgress: number;
	titleSlotRef: RefObject<HTMLDivElement>;
	isSharedView?: boolean;
}

export function ProfileHeaderCollapsed({
	collapseProgress,
	titleSlotRef,
	isSharedView = false,
}: ProfileHeaderCollapsedProps) {
	return (
		<div
			className="absolute top-0 inset-x-0 z-30 bg-white transition-opacity duration-150"
			style={{
				opacity: collapseProgress,
				pointerEvents: collapseProgress < 0.5 ? "none" : "auto",
			}}
			aria-hidden={collapseProgress < 0.5}
		>
			<div className="flex w-full items-center justify-between px-4 pt-3 pb-2 shrink-0 border-b border-sky-shade-20">
				{/* Invisible slot for morph target; visible title lives in Profile */}
				<div
					ref={titleSlotRef}
					className="text-sm font-semibold leading-5 text-gray-900 flex-1 text-left truncate opacity-0"
					aria-hidden
				>
					{content["profile.title"]}
				</div>
				{!isSharedView && <ProfileActionButtons />}
			</div>
		</div>
	);
}
