import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { content } from "../content";

interface ProfileState {
	profileAvatarId: string;
	profileName: string;
}

interface ProfileActions {
	setProfileAvatar: (avatarId: string) => void;
	setProfileName: (name: string) => void;
}

export const useProfileStore = create<ProfileState & ProfileActions>()(
	persist(
		(set) => ({
			profileAvatarId: "avatar-1",
			profileName: content["profile.title"],

			setProfileAvatar: (avatarId) => set({ profileAvatarId: avatarId }),
			setProfileName: (name) => set({ profileName: name }),
		}),
		{
			name: "profile",
			storage: createJSONStorage(() => localStorage),
		},
	),
);
