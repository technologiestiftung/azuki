import { pdf } from "@react-pdf/renderer";
import type { MatchedOccupation, UserProfile } from "@azuki/shared";
import {
	fetchProfileShortDescription,
	getCachedProfileShortDescription,
} from "../api/client";
import { content } from "../content";
import {
	ensureBufferPolyfill,
	loadPdfCardImageSrc,
	loadPdfIconSrc,
	loadPdfImageSrc,
	loadPdfPlaceholderSrc,
	triggerDownload,
	yieldToBrowser,
} from "../components/pdf/loadPdfAssets";
import { COLOR } from "../components/pdf/pdfTheme";
import {
	ProfilePdfDocument,
	type ProfilePdfAssets,
} from "./ProfilePdfDocument";
import { PROFILE_AVATARS } from "./profile-avatars";

const MASCOT_SRC = "/illustrations/star-neutral.svg";
const QR_SRC = "/illustrations/qr-code.svg";
const FALLBACK_AVATAR_SRC = "/illustrations/profile/avatar-1.svg";
/** CTA card fill — used behind mascot/QR so transparent SVGs don't get a white box. */
const CTA_SURFACE_BG = "#DDF4FF";

async function loadShortDescription(profile: UserProfile): Promise<string> {
	const cached = getCachedProfileShortDescription(profile);
	if (cached) {
		return cached;
	}
	try {
		return await fetchProfileShortDescription(profile);
	} catch {
		return "";
	}
}

export async function exportProfilePdf({
	profile,
	topOccupations,
	profileName,
	profileAvatarId,
}: {
	profile: UserProfile;
	topOccupations: MatchedOccupation[];
	profileName: string;
	profileAvatarId: string;
}): Promise<void> {
	ensureBufferPolyfill();
	await yieldToBrowser();

	const placeholderSrc = await loadPdfPlaceholderSrc();
	await yieldToBrowser();

	const topImageSrcs = await Promise.all(
		topOccupations.map((occupation) => {
			const imageUrl = occupation.images[0]?.url?.trim() || undefined;
			return loadPdfCardImageSrc(imageUrl, placeholderSrc);
		}),
	);

	const avatarPath =
		PROFILE_AVATARS.find((avatar) => avatar.id === profileAvatarId)?.url ??
		FALLBACK_AVATAR_SRC;

	const [mascotSrc, qrSrc, avatarSrc, shortDescription] = await Promise.all([
		loadPdfIconSrc(MASCOT_SRC, CTA_SURFACE_BG),
		loadPdfIconSrc(QR_SRC, CTA_SURFACE_BG),
		loadPdfImageSrc(avatarPath, {
			format: "png",
			backgroundColor: COLOR.sky0,
			outHeight: 256,
		}),
		loadShortDescription(profile),
	]);

	await yieldToBrowser();

	const assets: ProfilePdfAssets = {
		mascotSrc,
		qrSrc,
		avatarSrc,
		placeholderSrc,
		topImageSrcs,
	};

	const blob = await pdf(
		<ProfilePdfDocument
			profile={profile}
			topOccupations={topOccupations}
			shortDescription={shortDescription}
			profileName={profileName}
			assets={assets}
		/>,
	).toBlob();

	triggerDownload(blob, content["profile.export.filename"]);
}
