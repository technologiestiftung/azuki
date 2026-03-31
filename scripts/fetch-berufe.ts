/**
 * Fetches all Ausbildungsberufe from the BERUFENET API,
 * extracts structured fields, and saves them as data/berufe.json.
 *
 * Usage: npx tsx scripts/fetch-berufe.ts
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type {
  Occupation,
  WorkConditions,
  DegreeDistribution,
  OccupationImage,
} from "@azuki/shared";
import { SUBJECTS } from "@azuki/shared";

// --- API response types (model the external Arbeitsagentur API) ---

interface Infofeld {
  id: string;
  content?: string;
}

interface ApiBild {
  url?: string;
  unterschrift?: string;
  bildgruppe?: string;
}

interface ApiSteckbrief {
  kurz?: string;
  lang?: string;
}

interface ApiBerufItem {
  id: number;
  kurzBezeichnungNeutral?: string;
  steckbrief?: ApiSteckbrief;
  infofelder?: Infofeld[];
  bilder?: ApiBild[];
}

interface BerufeListResponse {
  page: {
    totalPages: number;
  };
  _embedded: {
    berufSucheList: Array<{
      id: number;
    }>;
  };
}
// --- Constants ---

const API_BASE = "https://rest.arbeitsagentur.de/infosysbub/bnet/pc/v1";
const API_KEY = "infosysbub-berufenet";
const DELAY_MS = 150;
const INFOFELD_IDS = {
  bedingungen: "b16-3",
  interessen: "b20-1",
  arbeitsSozialverhalten: "b20-4",
  verdienstEinkommen: "b50-0",
  digitalisierung: "b40-02",
  schulabschluss: "a31-12",
  schulfaecher: "a20-31",
  aufgabenKompakt: "b11-0",
  arbeitsorte: "b12-02",
  kompetenzenText: "b20-32",
  faehigkeiten: "b20-2",
} as const;

// --- Helpers ---

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function decodeHtmlEntities(html: string): string {
  return html
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&auml;/g, "ä")
    .replace(/&ouml;/g, "ö")
    .replace(/&uuml;/g, "ü")
    .replace(/&Auml;/g, "Ä")
    .replace(/&Ouml;/g, "Ö")
    .replace(/&Uuml;/g, "Ü")
    .replace(/&szlig;/g, "ß")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&nbsp;/g, " ")
    .replace(/&euro;/g, "€");
}

function stripHtml(html: string): string {
  let text = decodeHtmlEntities(html);
  text = text.replace(/&#\d+;/g, "");
  text = text.replace(/<[^>]+>/g, " ");
  text = text.replace(/\s+/g, " ").trim();
  return text;
}

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "X-API-Key": API_KEY },
  });
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${path}`);
  }
  return res.json() as Promise<T>;
}

// --- Extraction functions ---

function extractConditions(infofelder: Infofeld[]): WorkConditions {
  const field = infofelder.find((f) => f.id === INFOFELD_IDS.bedingungen);
  const text = field ? stripHtml(field.content || "") : "";

  return {
    outdoor: /im Freien/i.test(text),
    office: /Büroräumen/i.test(text),
    workshop: /Werkstätten|Produktionshallen/i.test(text),
    constructionSite: /Baustellen/i.test(text),
    screenWork: /Bildschirmarbeit/i.test(text),
    manualLabor: /Handarbeit/i.test(text),
    machinery: /technischen Geräten, Maschinen/i.test(text),
    noise: /Lärm/i.test(text),
    dirt: /Rauch, Staub|Schmutz/i.test(text),
    heavyLifting: /schweres Heben/i.test(text),
    heights: /Höhen/i.test(text),
    shiftWork: /Schichtarbeit/i.test(text),
    customerContact: /Kundenkontakt/i.test(text),
    teamwork: /Gruppen-, Teamarbeit/i.test(text),
    standingWalking: /Gehen und Stehen/i.test(text),
    irregularHours:
      /unregelmäßige Arbeitszeiten|Wochenend- und Feiertagsarbeit|Nachtarbeit/i.test(
        text,
      ),
    // Extended condition flags used by newer preference/no-go scoring rules.
    changingTasks: /häufig wechselnde Aufgaben/i.test(text),
    regulatedWork: /Beachtung vielfältiger Vorschriften/i.test(text),
    animalWork: /Umgang mit Tieren|Körperkontakt mit Tieren|Tierställen/i.test(
      text,
    ),
    accidentRisk: /Unfallgefahr|Infektionsgefahr|Absturzgefährdung/i.test(text),
		precisionWork: /Präzisions.+Feinarbeit/i.test(text),
		frequentAbsence: /häufige Abwesenheit vom Wohnort/i.test(text),
		changingWorkplaces: /wechselnde Arbeitsorte/i.test(text),
  };
}

function parseEuroToNumber(value: string): number {
  return parseFloat(value.replace(/\./g, "").replace(",", "."));
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) return (sorted[mid - 1] + sorted[mid]) / 2;
  return sorted[mid];
}

const INTEREST_CATEGORY_MAP: Record<string, string> = {
  "praktisch-konkreten Tätigkeiten": "praktisch-konkret",
  "theoretisch-abstrakten Tätigkeiten": "theoretisch-abstrakt",
  "kreativ-gestaltenden Tätigkeiten": "kreativ-gestaltend",
  "sozial-beratenden Tätigkeiten": "sozial-beratend",
  "organisatorisch-prüfenden Tätigkeiten": "organisatorisch-pruefend",
  "verwaltend-organisatorischen Tätigkeiten": "verwaltend-organisatorisch",
  "kaufmännisch-organisatorischen Tätigkeiten": "kaufmännisch-organisatorisch",
};

const INTEREST_KEYWORD_STOP_WORDS = new Set([
  "der",
  "die",
  "das",
  "den",
  "dem",
  "des",
  "ein",
  "eine",
  "einer",
  "eines",
  "einem",
  "einen",
  "und",
  "oder",
  "mit",
  "ohne",
  "für",
  "von",
  "auf",
  "im",
  "in",
  "am",
  "an",
  "aus",
  "bei",
  "zu",
  "zur",
  "zum",
  "auch",
  "sowie",
  "wie",
  "als",
  "durch",
]);

const INTEREST_KEYWORD_ALLOW_LIST = new Set(["rad", "weg"]);

/** Splits text into lowercase tokens (≥4 chars or explicitly allowed short words), drops stop words. e.g. "Planen von Abläufen" → ["planen", "abläufen"]. */
function tokenizeInterestText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]+/gu, " ")
    .split(/[\s-]+/)
    .map((token) => token.trim())
    .filter(
      (token) =>
        (token.length >= 4 || INTEREST_KEYWORD_ALLOW_LIST.has(token)) &&
        !INTEREST_KEYWORD_STOP_WORDS.has(token),
    );
}

/**
 * Extracts interests and interestKeywords from the BERUFENET "Interessen" infofeld (b20-1).
 * Two sources: (1) category names in name="Interesse an ..." → interests[], (2) "z.B. ..." list text → tokenized interestKeywords[].
 *
 * @example Input
 *   infofelder = [{ id: "b20-1", content: '... name="Interesse an theoretisch-abstrakten Tätigkeiten" ... z.B. Software entwickeln</p> ...' }]
 * @example Output
 *   { interests: ["theoretisch-abstrakt"], interestKeywords: ["software", "entwickeln", ...] }
 */
function extractInterestData(infofelder: Infofeld[]): {
  interests: string[];
  interestKeywords: string[];
} {
  const field = infofelder.find((f) => f.id === INFOFELD_IDS.interessen);
  if (!field?.content) return { interests: [], interestKeywords: [] };

  const decoded = decodeHtmlEntities(field.content);
  // Match BERUFENET category labels; map to normalized tags. e.g. "Interesse an kreativ-gestaltenden Tätigkeiten" → "kreativ-gestaltend".
  const categoryMatches = decoded.matchAll(/name="Interesse an ([^"]+)"/g);
  const interests: string[] = [];
  for (const m of categoryMatches) {
    const mapped = INTEREST_CATEGORY_MAP[m[1]];
    if (mapped && !interests.includes(mapped)) {
      interests.push(mapped);
    }
  }

  // b20-1 lists concrete examples as "z.B. ...</p>". Extract phrase, tokenize, dedupe. e.g. "z.B. Software entwickeln</p>" → ["software", "entwickeln"].
  const examplePhrases = Array.from(decoded.matchAll(/z\.B\.\s*([^<]+)<\/p>/g))
    .map((m) => m[1].replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const interestKeywords = [
    ...new Set(examplePhrases.flatMap((phrase) => tokenizeInterestText(phrase))),
  ];

  return { interests, interestKeywords };
}

/** Extracts deduplicated name="..." tags from an HTML infofeld, skipping listed headers. */
function extractNameTags(
  infofelder: Infofeld[],
  fieldId: string,
  skipTags: Set<string>,
): string[] {
  const field = infofelder.find((f) => f.id === fieldId);
  if (!field?.content) return [];

  const decoded = decodeHtmlEntities(field.content);
  const matches = decoded.matchAll(/name="([^"]+)"/g);
  const result: string[] = [];

  for (const m of matches) {
    const tag = m[1];
    if (skipTags.has(tag)) continue;
    if (!result.includes(tag)) {
      result.push(tag);
    }
  }

  return result;
}

const STRENGTH_TAG_HEADERS = new Set(["Merkmale des Arbeits- und Sozialverhaltens"]);
const SKILL_TAG_HEADERS = new Set(["Fähigkeiten", "Ausprägungsgrad"]);

function extractStrengthTags(infofelder: Infofeld[]): string[] {
  return extractNameTags(infofelder, INFOFELD_IDS.arbeitsSozialverhalten, STRENGTH_TAG_HEADERS);
}

function extractSkillTags(infofelder: Infofeld[]): string[] {
  return extractNameTags(infofelder, INFOFELD_IDS.faehigkeiten, SKILL_TAG_HEADERS);
}

function extractSalarySignal(infofelder: Infofeld[]): {
  salaryMonthlyMedian: number | null;
  salaryKnown: boolean;
} {
  const field = infofelder.find(
    (f) => f.id === INFOFELD_IDS.verdienstEinkommen,
  );
  if (!field?.content) {
    return { salaryMonthlyMedian: null, salaryKnown: false };
  }

  const decoded = decodeHtmlEntities(field.content);
  const plain = stripHtml(decoded);
  const euros = [
    ...plain.matchAll(/(\d{1,3}(?:\.\d{3})*(?:,\d+)?)\s*(?:€|euro)/gi),
  ];
  const monthlyMatches: number[] = [];
  const allMatches: number[] = [];

  for (const match of euros) {
    const raw = match[1];
    const num = parseEuroToNumber(raw);
    if (Number.isNaN(num) || num <= 100) continue;

    allMatches.push(num);

    const idx = match.index ?? 0;
    const start = Math.max(0, idx - 50);
    const end = Math.min(plain.length, idx + 50);
    const context = plain.slice(start, end).toLowerCase();
    if (/monat/i.test(context)) {
      monthlyMatches.push(num);
    }
  }

  const values = monthlyMatches.length > 0 ? monthlyMatches : allMatches;
  if (values.length === 0) {
    return { salaryMonthlyMedian: null, salaryKnown: false };
  }

  return {
    salaryMonthlyMedian: median(values),
    salaryKnown: true,
  };
}

function extractDigitalizationSignal(infofelder: Infofeld[]): boolean {
  const field = infofelder.find((f) => f.id === INFOFELD_IDS.digitalisierung);
  return Boolean(field?.content && stripHtml(field.content).length > 0);
}

function extractDegreeStats(infofelder: Infofeld[]): DegreeDistribution | null {
  const field = infofelder.find((f) => f.id === INFOFELD_IDS.schulabschluss);
  if (!field?.content) return null;

  const text = stripHtml(field.content);

  const result: DegreeDistribution = {
    noQualification: 0,
    secondary: 0,
    intermediate: 0,
    universityEntrance: 0,
  };

  const pctMatches = [...text.matchAll(/([^[]{0,120}?)\[(\d+\.?\d*)%\]/g)];

  for (const m of pctMatches) {
    const context = m[1].toLowerCase();
    const pct = parseFloat(m[2]);

    if (/ohne.*schulabschluss|ohne.*hauptschul/i.test(context)) {
      result.noQualification = pct;
    } else if (/hauptschul|berufsreife|erster.*schulabschluss/i.test(context)) {
      result.secondary = pct;
    } else if (
      /mittlerer|realschul|fachoberschul|sekundar.*i\b/i.test(context)
    ) {
      result.intermediate = pct;
    } else if (/hochschulreife|abitur|fachhochschul/i.test(context)) {
      result.universityEntrance = pct;
    }
  }

  if (
    result.noQualification +
      result.secondary +
      result.intermediate +
      result.universityEntrance ===
    0
  ) {
    return null;
  }
  return result;
}

function extractSubjects(infofelder: Infofeld[]): string[] {
  const field = infofelder.find((f) => f.id === INFOFELD_IDS.schulfaecher);
  if (!field?.content) return [];

  const text = stripHtml(field.content);
  const result = SUBJECTS.filter((s) => text.includes(s.dataLabel)).map(
    (s) => s.id,
  );

  // "Fremdsprachen" is a source bucket; map it to selectable language subjects.
  if (/Fremdsprachen/i.test(text)) {
    if (!result.includes("french")) result.push("french");
    if (!result.includes("spanish")) result.push("spanish");
  }

  return result;
}

function findInfofeld(infofelder: Infofeld[], id: string): string {
  const field = infofelder.find((f) => f.id === id);
  return field?.content ? stripHtml(field.content) : "";
}

function extractImages(item: ApiBerufItem): OccupationImage[] {
  if (!item.bilder || !Array.isArray(item.bilder)) return [];
  return item.bilder.map((b) => ({
    url: b.url || "",
    caption: b.unterschrift || "",
    imageGroup: b.bildgruppe || "",
  }));
}

// --- Main pipeline ---

async function fetchAllOccupationIds(): Promise<number[]> {
  const ids: number[] = [];
  let page = 0;
  let totalPages = 1;

  while (page < totalPages) {
    console.log(`  Loading occupation list page ${page}/${totalPages - 1}...`);
    const data = await apiFetch<BerufeListResponse>(
      `/berufe?suchwoerter=*&bg=100,102,105&page=${page}`,
    );

    totalPages = data.page.totalPages;
    for (const beruf of data._embedded.berufSucheList) {
      ids.push(beruf.id);
    }
    page++;
    await sleep(DELAY_MS);
  }

  return ids;
}

function processOccupationDetail(data: ApiBerufItem[]): Occupation | null {
  if (!data || data.length === 0) return null;

  const ausbildung = data[0];
  const taetigkeit = data.length > 1 ? data[1] : data[0];

  const ausbildungInfofelder = ausbildung.infofelder || [];
  const taetigkeitInfofelder = taetigkeit.infofelder || [];
  const mergedInfofelder = [...taetigkeitInfofelder, ...ausbildungInfofelder];

  const allImages = [
    ...extractImages(ausbildung),
    ...extractImages(taetigkeit),
  ];
  const seenUrls = new Set<string>();
  const images = allImages.filter((img) => {
    if (seenUrls.has(img.url)) return false;
    seenUrls.add(img.url);
    return true;
  });

  const descriptionShort = ausbildung.steckbrief?.kurz
    ? stripHtml(ausbildung.steckbrief.kurz)
    : null;
  const descriptionLong = ausbildung.steckbrief?.lang
    ? stripHtml(ausbildung.steckbrief.lang)
    : null;
  const salarySignal = extractSalarySignal(mergedInfofelder);
  const interestData = extractInterestData(taetigkeitInfofelder);

  return {
    id: ausbildung.id,
    name: ausbildung.kurzBezeichnungNeutral || "Unbekannt",
    descriptionShort,
    descriptionLong,
    taskSummary:
      findInfofeld(taetigkeitInfofelder, INFOFELD_IDS.aufgabenKompakt) || null,
    images,
    degreeStats: extractDegreeStats(ausbildungInfofelder),
    subjects: extractSubjects(ausbildungInfofelder),
    interests: interestData.interests,
    interestKeywords: interestData.interestKeywords,
    strengthTags: extractStrengthTags(taetigkeitInfofelder),
    skillTags: extractSkillTags(taetigkeitInfofelder),
    conditions: extractConditions(taetigkeitInfofelder),
    salaryMonthlyMedian: salarySignal.salaryMonthlyMedian,
    salaryKnown: salarySignal.salaryKnown,
    digitalizationSignal: extractDigitalizationSignal(mergedInfofelder),
    workLocations: findInfofeld(taetigkeitInfofelder, INFOFELD_IDS.arbeitsorte),
    competenciesText: findInfofeld(
      taetigkeitInfofelder,
      INFOFELD_IDS.kompetenzenText,
    ),
  };
}

async function main() {
  console.log("=== BERUFENET Fetch Script ===\n");

  console.log("Step 1: Fetching all occupation IDs...");
  const ids = await fetchAllOccupationIds();
  console.log(`  -> ${ids.length} IDs loaded.\n`);

  console.log("Step 2: Fetching details for each occupation...");
  const occupations: Occupation[] = [];
  let errors = 0;

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    if (i % 50 === 0) {
      console.log(`  ${i}/${ids.length} processed...`);
    }

    try {
      const data = await apiFetch<ApiBerufItem[]>(`/berufe/${id}`);
      const occupation = processOccupationDetail(data);
      if (occupation) {
        occupations.push(occupation);
      }
    } catch (err) {
      errors++;
      console.error(`  Error for ID ${id}: ${err}`);
    }

    await sleep(DELAY_MS);
  }

  console.log(
    `  -> ${occupations.length} occupations processed, ${errors} errors.\n`,
  );

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const outDir = resolve(__dirname, "../backend/src/data");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "berufe.json");
  writeFileSync(outPath, JSON.stringify(occupations, null, 2), "utf-8");
  console.log(`Step 3: Saved to ${outPath}`);

  const withDescription = occupations.filter((o) => o.descriptionLong).length;
  const withDegreeStats = occupations.filter((o) => o.degreeStats).length;
  const withInterests = occupations.filter(
    (o) => o.interests.length > 0,
  ).length;
  console.log(`\nStats:`);
  console.log(`  With description:  ${withDescription}/${occupations.length}`);
  console.log(`  With degree stats: ${withDegreeStats}/${occupations.length}`);
  console.log(`  With interests:    ${withInterests}/${occupations.length}`);
}

main().catch(console.error);
