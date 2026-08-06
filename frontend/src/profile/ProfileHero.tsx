import { useEffect, useState } from "react";
import type { UserProfile } from "@azuki/shared";
import {
	fetchProfileShortDescription,
	getCachedProfileShortDescription,
} from "../api/client";
import { content } from "../content";

interface ProfileHeroProps {
	heroControlsOpacity: number;
	titleOpacity: number;
	isSharedView?: boolean;
	profile: UserProfile;
}

export function ProfileHero({
	heroControlsOpacity,
	titleOpacity,
	isSharedView = false,
	profile,
}: ProfileHeroProps) {
	const [shortDescription, setShortDescription] = useState(
		() => getCachedProfileShortDescription(profile) ?? "",
	);

	useEffect(() => {
		const cached = getCachedProfileShortDescription(profile);
		if (cached !== null) {
			setShortDescription(cached);
			return undefined;
		}

		const controller = new AbortController();
		setShortDescription("");

		void (async () => {
			try {
				const result = await fetchProfileShortDescription(
					profile,
					controller.signal,
				);
				if (controller.signal.aborted) {
					return;
				}
				setShortDescription(result);
			} catch {
				if (controller.signal.aborted) {
					return;
				}
				setShortDescription("");
			}
		})();

		return () => {
			controller.abort();
		};
	}, [profile]);

	return (
		<div
			className={`flex flex-col gap-3 px-[45px] items-center mb-9 ${
				isSharedView ? "pt-6" : "pt-14"
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
			</div>

			<div className="flex flex-col items-center">
				<h1
					className="text-[32px] font-semibold leading-[42px] text-center text-sky-900"
					style={{ opacity: titleOpacity }}
					aria-hidden={titleOpacity < 0.5}
				>
					{content["profile.title"]}
				</h1>
				<p
					className="text-xl font-normal leading-7 text-sky-900 text-center transition-opacity duration-150"
					style={{ opacity: heroControlsOpacity }}
				>
					{shortDescription}
				</p>
			</div>
		</div>
	);
}
