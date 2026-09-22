import { pdf } from "@react-pdf/renderer";
import type { Occupation, UserProfile } from "@azuki/shared";
import {
	fetchMatchExplanations,
	getCachedMatchExplanations,
	type MatchExplanationsResponse,
} from "../../../api/client";
import { content } from "../../../content";
import {
	LOGO_LOCKUP_SRC,
	LOGO_WORDMARK_SRC,
	ensureBufferPolyfill,
	getSolidPdfPlaceholderSrc,
	loadPdfHeroImageSrc,
	loadPdfIconSrc,
	loadPdfLogoSrc,
	loadPdfPlaceholderSrc,
	revokePdfBlobUrls,
	triggerDownload,
	warmPdfRuntime,
} from "../../pdf/loadPdfAssets";
import {
	OccupationDetailPdfDocument,
	type OccupationDetailPdfAssets,
} from "./OccupationDetailPdfDocument";

const MASCOT_SRC = "/illustrations/star-neutral.svg";
const QR_SRC = "/illustrations/qr-code.svg";
const CTA_SURFACE_BG = "#DDF4FF";

function buildExportFilename(displayName: string): string {
	const safe = displayName
		.replace(/[^\p{L}\p{N}\s-]/gu, "")
		.trim()
		.replace(/\s+/g, "-");
	return safe
		? content["results.detail.export.filename"].replace("{name}", safe)
		: content["results.detail.export.filenameFallback"];
}

async function loadMatchExplanations(
	occupationId: number,
	profile: UserProfile,
): Promise<MatchExplanationsResponse | null> {
	const cached = getCachedMatchExplanations(occupationId, profile);
	if (cached) {
		return cached;
	}
	try {
		return await fetchMatchExplanations(occupationId, profile);
	} catch {
		return null;
	}
}

export async function exportOccupationDetailPdf({
	displayName,
	occupationDuration,
	salaryLabel,
	schoolDegreeLabel,
	taskItems,
	matchPercent,
	heroImageUrls,
	occupationId,
	profile,
}: {
	displayName: string;
	occupationDuration: string;
	salaryLabel: string;
	schoolDegreeLabel: string;
	taskItems: string[];
	matchPercent?: number;
	heroImageUrls: string[];
	occupationId: Occupation["id"];
	profile: UserProfile;
}): Promise<void> {
	ensureBufferPolyfill();
	await warmPdfRuntime();

	let placeholderPromise: Promise<string> | null = null;
	const resolvePlaceholder = () => {
		placeholderPromise ??= loadPdfPlaceholderSrc();
		return placeholderPromise;
	};

	const [
		mascotSrc,
		qrSrc,
		heroImageSrc,
		matchExplanations,
		wordmarkSrc,
		lockupSrc,
	] = await Promise.all([
		loadPdfIconSrc(MASCOT_SRC, CTA_SURFACE_BG),
		loadPdfIconSrc(QR_SRC, CTA_SURFACE_BG),
		loadPdfHeroImageSrc(heroImageUrls, resolvePlaceholder),
		loadMatchExplanations(occupationId, profile),
		loadPdfLogoSrc(LOGO_WORDMARK_SRC),
		loadPdfLogoSrc(LOGO_LOCKUP_SRC),
	]);

	const placeholderSrc = placeholderPromise
		? await placeholderPromise
		: getSolidPdfPlaceholderSrc();

	const assets: OccupationDetailPdfAssets = {
		mascotSrc,
		qrSrc,
		heroImageSrc: heroImageSrc || placeholderSrc,
		wordmarkSrc,
		lockupSrc,
	};

	try {
		const blob = await pdf(
			<OccupationDetailPdfDocument
				displayName={displayName}
				occupationDuration={occupationDuration}
				salaryLabel={salaryLabel}
				schoolDegreeLabel={schoolDegreeLabel}
				taskItems={taskItems}
				matchPercent={matchPercent}
				matchExplanations={matchExplanations}
				assets={assets}
			/>,
		).toBlob();

		triggerDownload(blob, buildExportFilename(displayName));
	} finally {
		revokePdfBlobUrls([heroImageSrc]);
	}
}
