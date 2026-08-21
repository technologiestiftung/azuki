import { useEffect, useState, type Ref } from "react";
import type { UserProfile } from "@azuki/shared";
import {
	fetchProfileShortDescription,
	getCachedProfileShortDescription,
} from "../api/client";
import { content } from "../content";
import { useProfileStore } from "../store/useProfileStore";
import { PROFILE_AVATARS } from "./profile-avatars";
import { ProfileEditDialog } from "./ProfileEditDialog";

interface ProfileHeroProps {
	heroControlsOpacity: number;
	titleOpacity: number;
	titleRef?: Ref<HTMLHeadingElement>;
	isSharedView?: boolean;
	profile: UserProfile;
}

export function ProfileHero({
	heroControlsOpacity,
	titleOpacity,
	titleRef,
	isSharedView = false,
	profile,
}: ProfileHeroProps) {
	const [shortDescription, setShortDescription] = useState(
		() => getCachedProfileShortDescription(profile) ?? "",
	);
	const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
	const { profileAvatarId, profileName, setProfileAvatar, setProfileName } =
		useProfileStore();
	const [draftName, setDraftName] = useState(
		profileName === content["profile.title"] ? "" : profileName,
	);
	const [draftAvatarId, setDraftAvatarId] = useState(profileAvatarId);

	const resolvedDraftName =
		draftName.trim() === "" ? content["profile.title"] : draftName.trim();
	const hasChanges =
		resolvedDraftName !== profileName || draftAvatarId !== profileAvatarId;

	const displayedName = isEditProfileOpen ? resolvedDraftName : profileName;
	const displayedAvatarId = isEditProfileOpen ? draftAvatarId : profileAvatarId;
	const profileAvatar =
		PROFILE_AVATARS.find((avatar) => avatar.id === displayedAvatarId)?.url ??
		"/illustrations/profile/avatar-2.svg";

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

	const openEditProfile = () => {
		setDraftName(profileName === content["profile.title"] ? "" : profileName);
		setDraftAvatarId(profileAvatarId);
		setIsEditProfileOpen(true);
	};

	const closeEditProfile = () => {
		setIsEditProfileOpen(false);
	};

	const saveProfileChanges = () => {
		if (!hasChanges) {
			return;
		}
		setProfileName(resolvedDraftName);
		setProfileAvatar(draftAvatarId);
		setIsEditProfileOpen(false);
	};

	return (
		<>
			<div
				className={`flex flex-col gap-3 px-[45px] items-center mb-9 ${
					isSharedView ? "pt-6" : "pt-14"
				}`}
			>
				<div className="relative w-[102px] h-[102px] z-10">
					<div className="flex items-center justify-center rounded-full overflow-hidden bg-sky-0 border-4 border-sky-50 w-full h-full p-4">
						<img
							src={profileAvatar}
							alt=""
							className="w-[70px] h-[70px] object-contain aspect-square"
						/>
					</div>
					<button
						className="absolute bottom-0 right-0 w-8 h-8 bg-sky-900 rounded-full flex items-center justify-center hover:bg-sky-shade-160 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
						onClick={openEditProfile}
						aria-label={content["profile.edit.open.ariaLabel"]}
					>
						<img src="/icons/edit.svg" alt="" />
					</button>
				</div>

				<div className="flex flex-col items-center w-full min-w-0">
					<h1
						ref={titleRef}
						className="max-w-full text-[32px] font-semibold leading-[42px] text-center text-sky-900 break-words"
						style={{ opacity: titleOpacity }}
						aria-hidden={titleOpacity < 0.5}
					>
						{displayedName}
					</h1>
					<p
						className="max-w-full text-xl font-normal leading-7 text-sky-900 text-center transition-opacity duration-150 break-words"
						style={{ opacity: heroControlsOpacity }}
					>
						{shortDescription}
					</p>
				</div>
			</div>
			<ProfileEditDialog
				isOpen={isEditProfileOpen}
				onClose={closeEditProfile}
				draftName={draftName}
				draftAvatarId={draftAvatarId}
				hasChanges={hasChanges}
				onDraftNameChange={setDraftName}
				onDraftAvatarChange={setDraftAvatarId}
				onSave={saveProfileChanges}
			/>
		</>
	);
}
