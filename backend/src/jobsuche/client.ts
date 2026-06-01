import type {
	AusbildungsplatzResult,
	AusbildungsplatzPreview,
} from "@azuki/shared";

const JOBSUCHE_BASE =
	"https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v4/jobs";
const API_KEY = "jobboerse-jobsuche";
const DEFAULT_RADIUS_KM = 25;
const MAX_PREVIEWS = 3;
// Fetch more than we display so client-side filtering (Duales Studium removal)
// can drop entries without leaving us short of previews.
const SAMPLE_SIZE = 10;
const REQUEST_TIMEOUT_MS = 5000;

interface JobsucheJob {
	arbeitgeber: string;
	arbeitsort?: {
		ort?: string;
	};
	eintrittsdatum?: string;
	// `beruf` is set on Ausbildung postings, absent on Duales Studium.
	// `studiengang` is the opposite. We filter on this distinction since
	// the API has no server-side flag for Ausbildung-only.
	beruf?: string;
	studiengang?: string;
}

interface JobsucheResponse {
	stellenangebote?: JobsucheJob[];
	maxErgebnisse: number;
}

function buildSearchUrl(beruf: string, plz: string, umkreis: number): string {
	const params = new URLSearchParams({
		was: beruf,
		wo: plz,
		umkreis: String(umkreis),
		angebotsart: "4",
	});
	return `https://www.arbeitsagentur.de/jobsuche/suche?${params.toString()}`;
}

function isAusbildung(job: JobsucheJob): boolean {
	// CONTRACT: this predicate only works because the search call above uses
	// `angebotsart=4` (Ausbildung + Duales Studium scope). Within that scope,
	// `beruf` is set whenever an Ausbildung component is offered — pure
	// Ausbildung or hybrid Ausbildung+Studium. Pure Duales Studium has empty
	// `beruf`. If `angebotsart` is ever changed or dropped, this filter alone
	// is NOT enough — regular full-time jobs (angebotsart=1) also have
	// `beruf` set.
	return Boolean(job.beruf);
}

function emptyResult(
	beruf: string,
	plz: string,
	umkreis: number,
): AusbildungsplatzResult {
	return {
		beruf,
		totalCount: 0,
		previews: [],
		searchUrl: buildSearchUrl(beruf, plz, umkreis),
	};
}

// Always resolves with a valid result shape — never rejects. Callers fan this
// out via `Promise.all`, so any rejection (network error, JSON parse failure,
// timeout) would 500 the whole batch even when only one beruf failed.
export async function searchAusbildungsplaetze(
	beruf: string,
	plz: string,
	umkreis: number = DEFAULT_RADIUS_KM,
): Promise<AusbildungsplatzResult> {
	const params = new URLSearchParams({
		was: beruf,
		wo: plz,
		umkreis: String(umkreis),
		angebotsart: "4",
		size: String(SAMPLE_SIZE),
	});

	try {
		const res = await fetch(`${JOBSUCHE_BASE}?${params.toString()}`, {
			headers: { "X-API-Key": API_KEY },
			signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
		});

		if (!res.ok) {
			console.error(`Jobsuche API error for "${beruf}": ${res.status}`);
			return emptyResult(beruf, plz, umkreis);
		}

		const data: JobsucheResponse = await res.json();
		const sample = data.stellenangebote ?? [];
		const ausbildungenInSample = sample.filter(isAusbildung);

		// `maxErgebnisse` counts everything matching `angebotsart=4` — Ausbildung
		// AND Duales Studium together. Scale by the in-sample Ausbildung ratio
		// so the badge doesn't overstate. If the sample is empty, fall back to
		// the raw total (we have nothing to scale by).
		const rawTotal = data.maxErgebnisse ?? 0;
		const totalCount =
			sample.length > 0
				? Math.round((rawTotal * ausbildungenInSample.length) / sample.length)
				: rawTotal;

		const previews: AusbildungsplatzPreview[] = ausbildungenInSample
			.slice(0, MAX_PREVIEWS)
			.map((job) => ({
				employer: job.arbeitgeber || "Unbekannter Arbeitgeber",
				city: job.arbeitsort?.ort || "Unbekannter Ort",
				eintrittsdatum: job.eintrittsdatum,
			}));

		return {
			beruf,
			totalCount,
			previews,
			searchUrl: buildSearchUrl(beruf, plz, umkreis),
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
		console.error(`Jobsuche API error for "${beruf}": ${reason}`);
		return emptyResult(beruf, plz, umkreis);
	}
}
