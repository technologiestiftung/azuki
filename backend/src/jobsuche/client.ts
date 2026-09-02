import type {
	VacancyResult,
	VacancyPreview,
	VacancyDetail,
	VacancyAddress,
} from "@azuki/shared";

const JOBSUCHE_BASE =
	"https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v6/jobs";
const JOBDETAILS_BASE =
	"https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v4/jobdetails";
const API_KEY = "jobboerse-jobsuche";
// `angebotsart=4` scopes to Ausbildung + Duales Studium, `ausbildungsart=0`
// narrows that to betriebliche Ausbildung.

const ANGEBOTSART_AUSBILDUNG = "4";
const AUSBILDUNGSART_BETRIEBLICH = "0";
const DEFAULT_RADIUS_KM = 25;
// limit to 10 weeks to avoid showing vacancies that are too old
const MAX_PUBLISHED_WEEKS = 10;
// Convert weeks to ms so we can compare against `Date.now() - published.getTime()`.
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
const MAX_PUBLISHED_AGE_MS = MAX_PUBLISHED_WEEKS * MS_PER_WEEK;
const SAMPLE_SIZE = 10;
const REQUEST_TIMEOUT_MS = 5000;

function normalizeLocationField(
	value: string | number | undefined,
): string | undefined {
	if (value === undefined || value === null) {
		return undefined;
	}
	const text = String(value).trim();
	if (!text || text === "null") {
		return undefined;
	}
	return text;
}

interface JobsucheLocation {
	adresse?: {
		strasse?: string;
		hausnummer?: string;
		plz?: string | number;
		ort?: string;
		ortsteil?: string;
	};
	breite?: number;
	laenge?: number;
}

interface JobsucheJob {
	firma?: string;
	stellenlokationen?: JobsucheLocation[];
	eintrittszeitraum?: { von?: string };
	veroeffentlichungszeitraum?: { von?: string };
	datumErsteVeroeffentlichung?: string;
	ausbildungsart?: string;
	referenznummer?: string;
}

interface JobsucheResponse {
	ergebnisliste?: JobsucheJob[];
	maxErgebnisse?: number;
}

interface JobsucheJobDetails {
	stellenangebotsTitel?: string;
	stellenangebotsBeschreibung?: string;
	firma?: string;
	hauptberuf?: string;
	arbeitszeitVollzeit?: boolean;
	geforderterBildungsabschluss?: string;
	eintrittszeitraum?: { von?: string };
	stellenlokationen?: JobsucheLocation[];
	referenznummer?: string;
}

function searchParams(
	occupation: string,
	postcode: string,
	distance: number,
): URLSearchParams {
	return new URLSearchParams({
		was: occupation,
		wo: postcode,
		umkreis: String(distance),
		angebotsart: ANGEBOTSART_AUSBILDUNG,
		ausbildungsart: AUSBILDUNGSART_BETRIEBLICH,
	});
}

function buildSearchUrl(
	occupation: string,
	postcode: string,
	distance: number,
): string {
	return `https://www.arbeitsagentur.de/jobsuche/suche?${searchParams(occupation, postcode, distance)}`;
}

function isPublishedWithinMaxAge(publishedAt: string | undefined): boolean {
	if (!publishedAt) {
		return false;
	}
	const published = new Date(publishedAt);
	if (Number.isNaN(published.getTime())) {
		return false;
	}
	const ageMs = Date.now() - published.getTime();
	return ageMs >= 0 && ageMs < MAX_PUBLISHED_AGE_MS;
}

function isAusbildung(job: JobsucheJob): boolean {
	return job.ausbildungsart === "AUSBILDUNG";
}

function publishedTime(preview: VacancyPreview): number {
	return preview.publishedAt ? Date.parse(preview.publishedAt) : 0;
}

function toStreet(adresse: JobsucheLocation["adresse"]): string | undefined {
	const street = normalizeLocationField(adresse?.strasse);
	if (!street) {
		return undefined;
	}
	const houseNumber = normalizeLocationField(adresse?.hausnummer);
	return houseNumber ? `${street} ${houseNumber}` : street;
}

function toPreview(job: JobsucheJob): VacancyPreview {
	const location = job.stellenlokationen?.[0];
	const adresse = location?.adresse;
	const latitude = location?.breite;
	const longitude = location?.laenge;
	return {
		referenznummer: job.referenznummer ?? "",
		employer: job.firma || "Unbekannter Arbeitgeber",
		city: normalizeLocationField(adresse?.ort) || "Unbekannter Ort",
		postcode: normalizeLocationField(adresse?.plz),
		district: normalizeLocationField(adresse?.ortsteil),
		street: toStreet(adresse),
		latitude:
			typeof latitude === "number" && Number.isFinite(latitude)
				? latitude
				: undefined,
		longitude:
			typeof longitude === "number" && Number.isFinite(longitude)
				? longitude
				: undefined,
		startDate: job.eintrittszeitraum?.von,
		publishedAt:
			job.veroeffentlichungszeitraum?.von ?? job.datumErsteVeroeffentlichung,
	};
}

function toAddress(location: JobsucheLocation): VacancyAddress {
	const adresse = location.adresse;
	const latitude = location.breite;
	const longitude = location.laenge;
	return {
		street: toStreet(adresse),
		postcode: normalizeLocationField(adresse?.plz),
		city: normalizeLocationField(adresse?.ort),
		latitude:
			typeof latitude === "number" && Number.isFinite(latitude)
				? latitude
				: undefined,
		longitude:
			typeof longitude === "number" && Number.isFinite(longitude)
				? longitude
				: undefined,
	};
}

export function toDetail(
	job: JobsucheJobDetails,
	referenznummer: string,
): VacancyDetail {
	return {
		referenznummer,
		occupationName: job.hauptberuf ?? "",
		title: job.stellenangebotsTitel ?? "",
		employer: job.firma || "Unbekannter Arbeitgeber",
		description: job.stellenangebotsBeschreibung ?? "",
		isFullTime:
			typeof job.arbeitszeitVollzeit === "boolean"
				? job.arbeitszeitVollzeit
				: null,
		educationLevel: job.geforderterBildungsabschluss ?? null,
		startDate: job.eintrittszeitraum?.von,
		addresses: (job.stellenlokationen ?? []).map(toAddress),
	};
}

export function parseJobsucheResponse(data: JobsucheResponse): {
	totalCount: number;
	previews: VacancyPreview[];
} {
	const previews = (data.ergebnisliste ?? [])
		.filter(isAusbildung)
		.map(toPreview)
		.filter((preview) => isPublishedWithinMaxAge(preview.publishedAt))
		.sort((a, b) => publishedTime(b) - publishedTime(a));

	return { totalCount: data.maxErgebnisse ?? 0, previews };
}

function emptyResult(
	occupation: string,
	postcode: string,
	distance: number,
): VacancyResult {
	return {
		occupation,
		totalCount: 0,
		previews: [],
		searchUrl: buildSearchUrl(occupation, postcode, distance),
	};
}

// Always resolves with a valid result shape — never rejects. Callers fan this
// out via `Promise.all`, so any rejection (network error, JSON parse failure,
// timeout) would 500 the whole batch even when only one beruf failed.
export async function searchVacancies(
	occupation: string,
	postcode: string,
	distance: number = DEFAULT_RADIUS_KM,
): Promise<VacancyResult> {
	const params = searchParams(occupation, postcode, distance);
	params.set("size", String(SAMPLE_SIZE));

	try {
		const res = await fetch(`${JOBSUCHE_BASE}?${params}`, {
			headers: { "X-API-Key": API_KEY },
			signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
		});

		if (!res.ok) {
			console.error(`Jobsuche API error for "${occupation}": ${res.status}`);
			return emptyResult(occupation, postcode, distance);
		}

		const { totalCount, previews } = parseJobsucheResponse(await res.json());

		return {
			occupation,
			totalCount,
			previews,
			searchUrl: buildSearchUrl(occupation, postcode, distance),
		};
	} catch (err) {
		let reason: string;
		if (err instanceof Error && err.name === "TimeoutError") {
			reason = "timeout";
		} else if (err instanceof Error) {
			reason = err.message;
		} else {
			reason = String(err);
		}
		console.error(`Jobsuche API error for "${occupation}": ${reason}`);
		return emptyResult(occupation, postcode, distance);
	}
}

const JOBDETAILS_MAX_ATTEMPTS = 2;
const JOBDETAILS_RETRY_DELAY_MS = 300;

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getJobDetails(
	referenznummer: string,
): Promise<VacancyDetail | null> {
	const encoded = Buffer.from(referenznummer, "utf-8").toString("base64");

	for (let attempt = 1; attempt <= JOBDETAILS_MAX_ATTEMPTS; attempt++) {
		try {
			const res = await fetch(`${JOBDETAILS_BASE}/${encoded}`, {
				headers: { "X-API-Key": API_KEY },
				signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
			});

			if (!res.ok) {
				// Retry transient server-side failures, but not client errors
				if (res.status >= 500 && attempt < JOBDETAILS_MAX_ATTEMPTS) {
					console.error(
						`Jobsuche jobdetails error for "${referenznummer}": ${res.status}, retrying`,
					);
					await sleep(JOBDETAILS_RETRY_DELAY_MS);
					continue;
				}
				console.error(
					`Jobsuche jobdetails error for "${referenznummer}": ${res.status}`,
				);
				return null;
			}

			const data = (await res.json()) as JobsucheJobDetails;
			return toDetail(data, referenznummer);
		} catch (err) {
			let reason: string;
			if (err instanceof Error && err.name === "TimeoutError") {
				reason = "timeout";
			} else if (err instanceof Error) {
				reason = err.message;
			} else {
				reason = String(err);
			}

			if (attempt < JOBDETAILS_MAX_ATTEMPTS) {
				console.error(
					`Jobsuche jobdetails error for "${referenznummer}": ${reason}, retrying`,
				);
				await sleep(JOBDETAILS_RETRY_DELAY_MS);
				continue;
			}
			console.error(
				`Jobsuche jobdetails error for "${referenznummer}": ${reason}`,
			);
			return null;
		}
	}

	return null;
}
