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
	// Empirically: Ausbildung has `beruf`, Duales Studium has `studiengang`.
	// Both fields can be missing in malformed entries — those we drop too.
	return Boolean(job.beruf) && !job.studiengang;
}

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

	const res = await fetch(`${JOBSUCHE_BASE}?${params.toString()}`, {
		headers: { "X-API-Key": API_KEY },
	});

	if (!res.ok) {
		console.error(`Jobsuche API error for "${beruf}": ${res.status}`);
		return {
			beruf,
			totalCount: 0,
			previews: [],
			searchUrl: buildSearchUrl(beruf, plz, umkreis),
		};
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
}
