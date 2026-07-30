import type { Ref } from "react";
import { content } from "../content";
import { ProfileActionButtons } from "./ProfileActionButtons";

interface ProfileHeroProps {
	heroControlsOpacity: number;
	titleSlotRef: Ref<HTMLDivElement>;
	showTitle: boolean;
	isSharedView?: boolean;
}

export function ProfileHero({
	heroControlsOpacity,
	titleSlotRef,
	showTitle,
	isSharedView = false,
}: ProfileHeroProps) {
	const hasFrostedBg = heroControlsOpacity > 0.5;

	return (
		<>
			{!isSharedView && (
				<div
					className="sticky top-0 px-4 pt-3 pb-2 z-[1] flex items-center justify-end transition-opacity duration-150"
					style={{
						opacity: heroControlsOpacity,
						pointerEvents: heroControlsOpacity < 0.5 ? "none" : "auto",
					}}
				>
					<ProfileActionButtons
						buttonClassName={`rounded-xl transition-[background-color,backdrop-filter] duration-150 ${
							hasFrostedBg
								? "bg-sky-shade-10/80 backdrop-blur-[4.5px]"
								: "bg-transparent backdrop-blur-none"
						}`}
					/>
				</div>
			)}
			<div
				className={`flex flex-col gap-3 px-[45px] items-center mb-9 ${
					isSharedView ? "pt-6" : ""
				}`}
			>
				<div className="relative w-[102px] h-[102px] z-10">
					<div className="w-full h-full rounded-full overflow-hidden bg-sky-0 border-4 border-sky-50">
						<img
							src="/illustrations/profile-star.png"
							alt=""
							className="w-full h-full object-cover"
						/>
					</div>
					{!isSharedView && (
						<div className="absolute bottom-0 right-0 bg-sky-900 rounded-full w-8 h-8 flex items-center justify-center">
							<img src="/icons/edit.svg" alt="" className="w-4 h-4" />
						</div>
					)}
				</div>

				<div className="flex flex-col items-center">
					<div ref={titleSlotRef} className="w-fit mx-auto">
						<h1
							className={`text-[32px] font-semibold leading-[42px] text-center ${
								showTitle ? "text-sky-900" : "invisible"
							}`}
							aria-hidden={!showTitle}
						>
							{content["profile.title"]}
						</h1>
					</div>
					<p
						className="text-xl font-normal leading-7 text-sky-900 text-center transition-opacity duration-150"
						style={{ opacity: heroControlsOpacity }}
					>
						{content["profile.shortDescriptionPlaceholder"]}
					</p>
				</div>
			</div>
		</>
	);
}
