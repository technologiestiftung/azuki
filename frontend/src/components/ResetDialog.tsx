import { useNavigate } from "react-router-dom";
import { PrimaryThemedButton } from "./primitives/buttons/PrimaryThemedButton";
import { SecondaryButton } from "./primitives/buttons/SecondaryButton";
import { DefaultDialog } from "./primitives/dialogs/DefaultDialog";
import { content } from "../content";
import { ROUTE_PATHS } from "../routing/routes";
import { useAppStore } from "../store/useAppStore";

interface ResetDialogProps {
	isOpen: boolean;
	onClose: () => void;
	download: () => void;
	title: string;
	description: string;
	downloadLabel: string;
}

export function ResetDialog({
	isOpen,
	onClose,
	download,
	title,
	description,
	downloadLabel,
}: ResetDialogProps) {
	const navigate = useNavigate();

	const handleReset = () => {
		useAppStore.getState().resetProfile();
		onClose();
		navigate(ROUTE_PATHS.start);
	};

	return (
		<DefaultDialog isOpen={isOpen} afterClose={onClose} aria-label={title}>
			<div className="flex flex-col gap-10 rounded-4xl bg-gray-100">
				<div className="flex flex-col gap-1">
					<h2 className="text-lg font-semibold text-sky-900 px-2">{title}</h2>
					<p className="text-lg font-normal text-sky-900 px-2">{description}</p>
				</div>
				<div className="flex flex-col gap-2">
					<PrimaryThemedButton
						className="w-full flex items-center justify-center gap-2"
						onClick={download}
					>
						<img src="/icons/download.svg" alt="" className="w-6 h-6" />
						{downloadLabel}
					</PrimaryThemedButton>
					<SecondaryButton
						className="w-full flex items-center justify-center gap-2"
						onClick={handleReset}
						ariaLabel={content["profile.resetDialog.cta"]}
						title={content["profile.resetDialog.cta"]}
					>
						<img src="/icons/refresh.svg" alt="" className="w-6 h-6" />
						{content["profile.resetDialog.cta"]}
					</SecondaryButton>
				</div>
			</div>
		</DefaultDialog>
	);
}
