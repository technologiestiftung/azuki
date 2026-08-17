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
	sleep,
	triggerDownload,
	yieldToBrowser,
} from "../components/pdf/loadPdfAssets";
import {
	ProfilePdfDocument,
	type ProfilePdfAssets,
} from "./ProfilePdfDocument";

const MASCOT_SRC = "/illustrations/star-neutral.svg";
const QR_SRC = "/illustrations/qr-code.svg";
const AVATAR_SRC = "/illustrations/profile-star.png";
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
}: {
	profile: UserProfile;
	topOccupations: MatchedOccupation[];
}): Promise<void> {
	ensureBufferPolyfill();
	await yieldToBrowser();

	const placeholderSrc = await loadPdfPlaceholderSrc();
	await yieldToBrowser();

	const topImageSrcs: string[] = [];
	for (let i = 0; i < topOccupations.length; i++) {
		if (i > 0) {
			await sleep(80);
		}
		const imageUrl = topOccupations[i].images[0]?.url?.trim() || undefined;
		const src = await loadPdfCardImageSrc(imageUrl, placeholderSrc);
		topImageSrcs.push(src);
		await yieldToBrowser();
	}

	const [mascotSrc, qrSrc, avatarSrc, shortDescription] = await Promise.all([
		loadPdfIconSrc(MASCOT_SRC, CTA_SURFACE_BG),
		loadPdfIconSrc(QR_SRC, CTA_SURFACE_BG),
		loadPdfImageSrc(AVATAR_SRC, { format: "png" }),
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
			assets={assets}
		/>,
	).toBlob();

	triggerDownload(blob, content["profile.export.filename"]);
}
