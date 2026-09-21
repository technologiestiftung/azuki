import { content } from "../content";
import { BottomSheet } from "../components/primitives/bottom-sheet/BottomSheet";
import { GhostIconButton } from "../components/primitives/buttons/GhostIconButton";
import { ThemedIconButton } from "../components/primitives/buttons/ThemedIconButton";
import { TextInput } from "../components/primitives/text-inputs/TextInput";
import { PROFILE_AVATARS } from "./profile-avatars";

interface ProfileEditDialogProps {
	isOpen: boolean;
	onClose: () => void;
	draftName: string;
	draftAvatarId: string;
	hasChanges: boolean;
	onDraftNameChange: (name: string) => void;
	onDraftAvatarChange: (avatarId: string) => void;
	onSave: () => void;
}

export function ProfileEditDialog({
	isOpen,
	onClose,
	draftName,
	draftAvatarId,
	hasChanges,
	onDraftNameChange,
	onDraftAvatarChange,
	onSave,
}: ProfileEditDialogProps) {
	return (
		<BottomSheet
			open={isOpen}
			onClose={onClose}
			ariaLabel={content["profile.edit.bottomSheet.ariaLabel"]}
		>
			<div className="flex flex-col gap-4 pb-10 pt-1">
				<div className="flex w-full justify-between items-center px-4">
					<GhostIconButton
						onClick={onClose}
						iconSrc="/icons/close-black.svg"
						aria-label={content["profile.edit.close.ariaLabel"]}
						className="w-12 h-12"
					/>
					<h2 className="text-2xl font-semibold leading-8 text-sky-900">
						{content["profile.edit.title"]}
					</h2>
					<ThemedIconButton
						className="rounded-full w-12 h-12"
						onClick={onSave}
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
							className="text-lg font-medium text-sky-shade-170"
						>
							{content["profile.edit.input.name"]}
						</label>
						<TextInput
							id="name"
							value={draftName}
							placeholder={content["profile.edit.input.placeholder"]}
							onChange={(e) => onDraftNameChange(e.target.value)}
							onClearInput={() => onDraftNameChange("")}
							submitDisabled={!draftName.trim()}
							onSubmit={hasChanges ? onSave : undefined}
						/>
					</div>
				</div>
				<div className="flex flex-col gap-1.5">
					<h3 className="text-lg font-medium text-sky-shade-170 px-4">
						{content["profile.edit.images.label"]}
					</h3>
					<div className="flex gap-2 overflow-x-scroll [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-0.5">
						{PROFILE_AVATARS.map((avatar) => (
							<button
								type="button"
								key={avatar.id}
								className={`w-16 h-16 rounded-full border-2 bg-sky-0 flex items-center justify-center aspect-square p-2 first:ml-4 last:mr-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 ${draftAvatarId === avatar.id ? "border-sky-300" : "border-sky-50"}`}
								onClick={() => onDraftAvatarChange(avatar.id)}
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
	);
}
