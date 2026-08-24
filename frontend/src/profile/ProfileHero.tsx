import { useEffect, useState, type Ref } from "react";
import type { UserProfile } from "@azuki/shared";
import {
	fetchProfileShortDescription,
	getCachedProfileShortDescription,
} from "../api/client";
import { content } from "../content";
import { BottomSheet } from "../components/primitives/bottom-sheet/BottomSheet";
import { GhostIconButton } from "../components/primitives/buttons/GhostIconButton";
import { ThemedIconButton } from "../components/primitives/buttons/ThemedIconButton";
import { TextInput } from "../components/primitives/text-inputs/TextInput";
import { useProfileStore } from "../store/useProfileStore";
import { PROFILE_AVATARS } from "./profile-avatars";

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

				<div className="flex flex-col items-center">
					<h1
						ref={titleRef}
						className="text-[32px] font-semibold leading-[42px] text-center text-sky-900"
						style={{ opacity: titleOpacity }}
						aria-hidden={titleOpacity < 0.5}
					>
						{displayedName}
					</h1>
					<p
						className="text-xl font-normal leading-7 text-sky-900 text-center transition-opacity duration-150"
						style={{ opacity: heroControlsOpacity }}
					>
						{shortDescription}
					</p>
				</div>
			</div>
			<BottomSheet
				open={isEditProfileOpen}
				onClose={closeEditProfile}
				ariaLabel={content["profile.edit.bottomSheet.ariaLabel"]}
			>
				<div className="flex flex-col gap-4 pb-10 pt-1">
					<div className="flex w-full justify-between items-center px-4">
						<GhostIconButton
							onClick={closeEditProfile}
							iconSrc="/icons/close-black.svg"
							aria-label={content["profile.edit.close.ariaLabel"]}
							className="w-12 h-12"
						/>
						<h2 className="text-2xl font-semibold leading-8 text-sky-900">
							{content["profile.edit.title"]}
						</h2>
						<ThemedIconButton
							className="rounded-full w-12 h-12"
							onClick={saveProfileChanges}
							disabled={!hasChanges}
						>
							<img
								src="/icons/check-black.svg"
								alt=""
								className={`w-6 h-6 ${hasChanges ? "block" : "hidden"}`}
							/>
							<img
								src="/icons/check-sky-shade.svg"
								alt=""
								className={`w-6 h-6 ${hasChanges ? "hidden" : "block"}`}
							/>
						</ThemedIconButton>
					</div>
					<div className="flex flex-col gap-6 px-4">
						<div className="flex flex-col gap-1.5">
							<label
								htmlFor="name"
								className="text-lg font-medium text-gray-700"
							>
								{content["profile.edit.input.name"]}
							</label>
							<TextInput
								id="name"
								value={draftName}
								placeholder={content["profile.edit.input.placeholder"]}
								onChange={(e) => setDraftName(e.target.value)}
								onClearInput={() => setDraftName("")}
								submitDisabled={!draftName.trim()}
								onSubmit={saveProfileChanges}
							/>
						</div>
					</div>
					<div className="flex flex-col gap-1.5">
						<h3 className="text-lg font-medium text-gray-700 px-4">
							{content["profile.edit.images.label"]}
						</h3>
						<div className="flex gap-2 overflow-x-scroll [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-0.5">
							{PROFILE_AVATARS.map((avatar) => (
								<button
									type="button"
									key={avatar.id}
									className={`w-16 h-16 rounded-full border-2 bg-sky-0 flex items-center justify-center aspect-square p-2 first:ml-4 last:mr-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 ${draftAvatarId === avatar.id ? "border-sky-300" : "border-sky-50"}`}
									onClick={() => setDraftAvatarId(avatar.id)}
									aria-label={`${avatar.alt} ${content["profile.edit.images.ariaLabel"]}`}
								>
									<img
										src={avatar.url}
										alt={avatar.alt}
										className="w-12 h-12 object-contain"
									/>
								</button>
							))}
						</div>
					</div>
				</div>
			</BottomSheet>
		</>
	);
}
