import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { content } from "../../../content";
import { ROUTE_PATHS } from "../../../routing/routes";
import {
	COLLAPSED_THRESHOLD,
	CollapsingHeaderTopRow,
} from "../../collapsing-header/CollapsingHeaderTopRow";
import { GhostIconButton } from "../../primitives/buttons/GhostIconButton";
import { OccupationDetailActionButtons } from "./OccupationDetailActionButtons";

interface CollapseCrossfadeProps {
	progress: number;
	collapsed: boolean;
	expanded: ReactNode;
	collapsedContent: ReactNode;
}

function CollapseCrossfade({
	progress,
	collapsed,
	expanded,
	collapsedContent,
}: CollapseCrossfadeProps) {
	return (
		<div className="grid">
			<div
				className="[grid-area:1/1] transition-opacity duration-150"
				style={{
					opacity: 1 - progress,
					pointerEvents: collapsed ? "none" : "auto",
				}}
				aria-hidden={collapsed}
			>
				{expanded}
			</div>
			<div
				className="[grid-area:1/1] transition-opacity duration-150"
				style={{
					opacity: progress,
					pointerEvents: collapsed ? "auto" : "none",
				}}
				aria-hidden={!collapsed}
			>
				{collapsedContent}
			</div>
		</div>
	);
}

interface OccupationDetailHeaderCollapsedProps {
	title: string;
	collapseProgress: number;
	titleRevealProgress: number;
	onDownload: () => void;
	onShare: () => void;
	onToggleFavorite: () => void;
	isFavorite: boolean;
	downloadDisabled: boolean;
}

export function OccupationDetailHeaderCollapsed({
	title,
	collapseProgress,
	titleRevealProgress,
	onDownload,
	onShare,
	onToggleFavorite,
	isFavorite,
	downloadDisabled,
}: OccupationDetailHeaderCollapsedProps) {
	const navigate = useNavigate();
	const collapsed = collapseProgress > COLLAPSED_THRESHOLD;
	const goBack = () => navigate(ROUTE_PATHS.resultsList);

	return (
		<CollapsingHeaderTopRow
			title={title}
			progress={collapseProgress}
			titleRevealProgress={titleRevealProgress}
			collapsedFill
			gradientFrom="white"
			leading={
				<CollapseCrossfade
					progress={collapseProgress}
					collapsed={collapsed}
					expanded={
						<GhostIconButton
							iconSrc="/icons/arrow-back-black.svg"
							onClick={goBack}
							ariaLabel={content["navigation.back"]}
							title={content["navigation.back"]}
							iconSize="w-5 h-5"
							className="bg-sky-shade-10/50 rounded-xl backdrop-blur-[4.5px]"
							tabIndex={collapsed ? -1 : undefined}
						/>
					}
					collapsedContent={
						<GhostIconButton
							iconSrc="/icons/arrow-back-black.svg"
							onClick={goBack}
							ariaLabel={content["navigation.back"]}
							title={content["navigation.back"]}
							iconSize="w-5 h-5"
							tabIndex={collapsed ? undefined : -1}
						/>
					}
				/>
			}
			trailing={
				<CollapseCrossfade
					progress={collapseProgress}
					collapsed={collapsed}
					expanded={
						<OccupationDetailActionButtons
							onDownload={onDownload}
							onShare={onShare}
							onToggleFavorite={onToggleFavorite}
							isFavorite={isFavorite}
							downloadDisabled={downloadDisabled}
							buttonClassName="bg-sky-shade-10/50 rounded-xl backdrop-blur-[4.5px]"
							tabIndex={collapsed ? -1 : undefined}
						/>
					}
					collapsedContent={
						<OccupationDetailActionButtons
							onDownload={onDownload}
							onShare={onShare}
							onToggleFavorite={onToggleFavorite}
							isFavorite={isFavorite}
							downloadDisabled={downloadDisabled}
							tabIndex={collapsed ? undefined : -1}
						/>
					}
				/>
			}
		/>
	);
}
