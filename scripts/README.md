# scripts/

Every file in this folder, what it does, and a concrete before → after example. Grouped by role: the main data pipeline, availability data, shared utilities, and standalone tools.

## Contents

**Main catalog pipeline**
- [`fetch-berufe.ts`](#fetch-berufets) — pipeline entry
- [`apply-access-overrides.ts`](#apply-access-overridests) — in-pipeline
- [`apply-condition-overrides.ts`](#apply-condition-overridests) — in-pipeline
- [`apply-joblinge-exclusions.ts`](#apply-joblinge-exclusionsts) — in-pipeline
- [`data/joblinge-exclusions.json`](#datajoblinge-exclusionsjson) — data file
- [`generate-short-descriptions.ts`](#generate-short-descriptionsts) — LLM batch

**Availability data (per-Bundesland trainee counts)**
- [`build-trainee-fixtures.ts`](#build-trainee-fixturests) — fixture builder
- [`build-availability.ts`](#build-availabilityts) — join

**Utilities (imported, no CLI)**
- [`normalizeKldb.ts`](#normalizekldbts)
- [`normName.ts`](#normnamets)

**Standalone tools**
- [`vercel-build.mjs`](#vercel-buildmjs) — deploy
- [`report-data-refresh.ts`](#report-data-refreshts) — refresh PR body
- [`verify-cleanup.ts`](#verify-cleanupts) — guard

## Pipeline overview

Where the data comes from, what transforms it, and what lands in the app.

```
BERUFENET REST API
  → fetch-berufe.ts
      → apply-access-overrides
      → apply-condition-overrides
      → apply-joblinge-exclusions
  → backend/src/data/berufe.json

berufe.json
  → generate-short-descriptions.ts   (via OpenRouter LLM)
  → berufe.json (shortDescription field filled in)

DAZUBI + Destatis xlsx snapshots
  → build-trainee-fixtures.ts
  → build-availability.ts            (joins by name + KldB)
  → shared/data/availability-by-state.json
```

---

## Main catalog pipeline

### `fetch-berufe.ts`

*Pipeline entry.* Pages through the BERUFENET REST API, pulls every Ausbildungsberuf, extracts structured fields (access level, work conditions, salary bands, interests, degree stats, images), then runs each of the three override/exclusion scripts, and writes the final `backend/src/data/berufe.json`.

| | |
|---|---|
| **Runs** | `npm run data:fetch-berufe` |
| **Reads** | BERUFENET REST — `rest.arbeitsagentur.de/infosysbub/bnet/pc/v1` |
| **Writes** | `backend/src/data/berufe.json` (≈528 occupations after exclusions) |
| **Depends on** | `apply-*.ts`, `normalizeKldb.ts` |

**Example — one API item → one Occupation record**

From API:
```json
{
  "id": 33209,
  "kurzBezeichnungNeutral": "Änderungsschneider/in",
  "kldb2010": "B 28212",
  "infofelder": [
    { "id": "a30-0",  "content": "…keine bestimmte Schulbildung…" },
    { "id": "b16-3",  "content": "…Kundenkontakt…Nähmaschinen…" },
    { "id": "a31-12", "content": "Hauptschulabschluss 33%…" }
  ]
}
```

Shape written to `berufe.json`:
```json
{
  "id": 33209,
  "name": "Änderungsschneider/in",
  "germanOccupationCode": "28212",           // via normalizeKldb
  "accessLevel": "none",                     // parsed from a30-0
  "conditions": { "customerContact": true, "changingWorkplaces": false, "...": "..." },
  "degreeStats": { "hauptschule": 0.33, "mittlere": 0.17, "...": "..." },
  "interests": ["..."],
  "shortDescription": null                   // filled later by LLM script
}
```

---

### `apply-access-overrides.ts`

*In-pipeline.* A tiny curated data patch. BERUFENET's formal access level is sometimes permissive ("Realschule" or unrestricted) while the de-facto access reality is Fachhochschulreife or Abitur — mostly the design-Akademie family (Mappenprüfung, private schools, Abi-heavy cohorts). This script re-labels 10 such Berufe so the existing scoring penalty and prompt rule kick in without any new code.

| | |
|---|---|
| **Runs** | Inside `fetch-berufe.ts`; or standalone `npx tsx scripts/apply-access-overrides.ts` |
| **Modifies** | `berufe.json` in place |
| **Trigger** | Add an entry only when formal accessLevel materially understates practical access AND cohort evidence (or school type) confirms it |

**Example override — Gamedesigner/in (id 14869)**

Before:
```json
{
  "id": 14869,
  "name": "Gamedesigner/in (Ausbildung)",
  "accessLevel": "none"
}
```

After:
```json
{
  "id": 14869,
  "name": "Gamedesigner/in (Ausbildung)",
  "accessLevel": "fachhochschulreife"
}
```

Sample console output:
```
Applied 10 access-level overrides.

  14217   Designer/in (Ausbildung) - Grafik              none → fachhochschulreife
  14869   Gamedesigner/in (Ausbildung)                   none → fachhochschulreife
  14557   Designer/in (Ausbildung) - angewandte Formgeb…none → fachhochschulreife
  ...
```

---

### `apply-condition-overrides.ts`

*In-pipeline.* Patches curated `conditions` flags where BERUFENET's regex-parsed text disagrees with plain-language meaning. Two current cohorts:

- **warehouse Berufe** wrongly tagged `changingWorkplaces=true` (zones inside one facility, not multi-site)
- **care / therapy / education roles** that miss `customerContact` because BERUFENET writes "Patientenkontakt" / "Klientenkontakt", which the `/Kundenkontakt/i` regex doesn't match

| | |
|---|---|
| **Runs** | Inside `fetch-berufe.ts`; or standalone `npx tsx scripts/apply-condition-overrides.ts` |
| **Modifies** | `berufe.json` in place |

**Example — Logopäde/Logopädin (id 8764)**

Before:
```json
{
  "name": "Logopäde/Logopädin (Ausbildung)",
  "conditions": {
    "customerContact": false,
    "changingWorkplaces": false
  }
}
```

After (patch: `customerContact=true`):
```json
{
  "name": "Logopäde/Logopädin (Ausbildung)",
  "conditions": {
    "customerContact": true,
    "changingWorkplaces": false
  }
}
```

**Example — Fachkraft Lagerlogistik (id 27448)**

Before:
```json
{
  "conditions": {
    "changingWorkplaces": true   // "Lagerhalle/Kühlhaus/Freien"
  }
}
```

After (patch: `changingWorkplaces=false`):
```json
{
  "conditions": {
    "changingWorkplaces": false  // zones in one facility
  }
}
```

---

### `apply-joblinge-exclusions.ts`

*In-pipeline.* The catalog pruner. Removes every occupation whose name matches the §66 BBiG / §42r HwO Fachpraktiker regex (Reha-only trainings that aren't openly accessible), plus every id listed in `data/joblinge-exclusions.json` (Joblinge's own "nicht geeignet" or manually flagged set). Whatever survives becomes the final catalog.

| | |
|---|---|
| **Runs** | Inside `fetch-berufe.ts`; or standalone `npx tsx scripts/apply-joblinge-exclusions.ts` |
| **Removes by** | Name regex `/\(§\s*66\s*BBiG\|§\s*42r\s*HwO/i` OR id in exclusion list |
| **Post-run count** | ≈528 kept |

**Example — three removals**

```jsonc
// removed by name regex — §66 Fachpraktiker
{ "id": 4708,  "name": "Fachpraktiker/in für Lagerlogistik (§66 BBiG/§42r HwO)" }
      → reason: "section66"

// removed by exclusion list — Joblinge said "nein"
{ "id": 14688, "name": "Callcenteragent/in" }
      → reason: "not_suitable"

// removed by exclusion list — manually flagged
{ "id": 3789,  "name": "Brauer/in und Mälzer/in" }
      → reason: "flagged"
```

Sample console output — removal counts vary with each BERUFENET pull:
```
Removed 189 occupations (73 §66, 116 Joblinge-listed). 528 remain.
Wrote backend/src/data/berufe.json
```

---

### `data/joblinge-exclusions.json`

*Data file.* A frozen list of `{ id, name, reason }` records consumed by the exclusions script. Two reason values:

- `not_suitable` — Joblinge's "Richtige Ausbildung?" column said nein
- `flagged` — highlighted for removal

The `name` field is documentation only — only `id` and `reason` are read.

First few entries:
```json
[
  { "id": 13952, "name": "Amtliche/r Fachassistent/in (Fleischkontrolleur/in)", "reason": "not_suitable" },
  { "id": 14616, "name": "Assistent/in - Gesundheits- und Sozialwesen",         "reason": "not_suitable" },
  { "id": 14688, "name": "Callcenteragent/in",                                  "reason": "not_suitable" },
  { "id": 2674,  "name": "Bogenmacher/in",                                      "reason": "flagged" },
  { "id": 3789,  "name": "Brauer/in und Mälzer/in",                             "reason": "flagged" }
]
```

---

### `generate-short-descriptions.ts`

*LLM batch.* Fills the `shortDescription` field on every occupation using OpenRouter with the default model. Resumable — skips entries that already have one unless `--force`. Batched at 15 per request with 500 ms throttle; input truncated to 500 chars. The output is youth-friendly, plain-German copy shown in the frontend result cards.

| | |
|---|---|
| **Runs** | `npm run data:generate-short-descriptions` (requires `OPENROUTER_API_KEY` in `.env`) |
| **Flags** | `--limit N`, `--force` |
| **Modifies** | `berufe.json`: `shortDescription` field |

**Example — one occupation before and after**

Before:
```json
{
  "name": "Änderungsschneider/in",
  "descriptionLong": "Änderungsschneider/innen nähen Kleidungsstücke um, ändern aber auch Heimtextilien wie Vorhänge oder Gardinen. Sie beraten ihre Kunden über Änderungsmöglichkeiten und Kosten, stecken Hosen, Röcke oder Kleider ab, kürzen sie oder lassen zur Verlängerung Säume aus…",
  "shortDescription": null
}
```

After:
```json
{
  "name": "Änderungsschneider/in",
  "shortDescription": "Du änderst und reparierst Kleidung — kürzen, weiten, Reißverschlüsse tauschen. Kundengespräch, Nähmaschine, Bügeleisen. Handwerklich, ruhig, mit direktem Ergebnis."
}
```

---

## Availability data (per-Bundesland trainee counts)

### `build-trainee-fixtures.ts`

*Fixture builder.* Reads the two yearly xlsx snapshots (BIBB DAZUBI "Alle Berufe nach Ländern" + Destatis Berufliche Schulen 21121-10..13) with `exceljs` and writes slim JSON fixtures consumed by `build-availability.ts`. Run rarely — only when refreshing the underlying xlsx.

The xlsx are ~17 MB and therefore gitignored: download them once into `data/popularity-source/` ([how](../data/popularity-source/README.md)), or point `POPULARITY_DATA_DIR` at them. The script fails with the download instructions if they are absent. Its committed output means a normal checkout never needs them.

| | |
|---|---|
| **Runs** | `npm run data:build-trainee-fixtures` |
| **Reads** | `data/popularity-source/dazubi-all-berufe-2024.xlsx`, `data/popularity-source/destatis-2024-25.xlsx` (override dir via `POPULARITY_DATA_DIR`) |
| **Writes** | `shared/data/dazubi-trainee-starts.json`, `shared/data/destatis-trainee-starts.json` |

**Example — output row shapes**

`dazubi-trainee-starts.json`:
```json
[
  { "bundesland": "Bayern", "name": "Kaufmann/-frau - Einzelhandel", "anfaenger": 4820 },
  { "bundesland": "Berlin", "name": "Fachinformatiker/-in",          "anfaenger": 612 }
]
```

`destatis-trainee-starts.json`:
```json
[
  { "germanOccupationCode": "81302", "bundesland": "Nordrhein-Westfalen", "students": 1104 }
]
```

---

### `build-availability.ts`

*Join.* Joins `berufe.json` (the BERUFENET catalog) against both trainee-count fixtures to produce `availability-by-state.json` — an `{ occupationId → { bundesland → count } }` map used by the frontend to show whether an occupation is offered in the user's state. DAZUBI joins by normalized name (`normName`); Destatis joins by KldB code (`normalizeKldb`).

| | |
|---|---|
| **Runs** | `npm run data:build-availability` |
| **Reads** | `berufe.json`, `popularity-index.json`, both trainee-starts fixtures |
| **Writes** | `shared/data/availability-by-state.json` |

**Example — three inputs → one merged record**

Inputs:
```jsonc
// berufe.json entry
{ "id": 9162, "name": "Erzieher/in", "germanOccupationCode": "83112" }

// dazubi row (name match via normName)
{ "bundesland": "Bayern", "name": "Erzieher/-in", "anfaenger": 2410 }

// destatis row (KldB match)
{ "germanOccupationCode": "83112", "bundesland": "Berlin", "students": 1030 }
```

Output — `availability-by-state.json`:
```json
{
  "9162": {
    "Bayern": 2410,
    "Berlin": 1030
  }
}
```

---

## Utilities (imported, no CLI)

### `normalizeKldb.ts`

Cleans up KldB 2010 codes returned by BERUFENET so the same shape lines up with Destatis. Strips the agency-internal `"B "` prefix and any whitespace; warns on non-numeric residues (upstream shape drift).

Used by `fetch-berufe.ts`, `build-trainee-fixtures.ts`, `build-availability.ts`. No CLI.

**Example inputs → outputs**
```
normalizeKldb("B 28212")   →  "28212"
normalizeKldb("  81302 ")  →  "81302"
normalizeKldb("")          →  null
normalizeKldb(null)        →  null
normalizeKldb("B 28X12")   →  "28X12"  // + console.warn
```

---

### `normName.ts`

Normalizes DAZUBI-style Berufsbezeichnungen so name-based joins line up: lowercases, strips parenthesized suffixes, collapses gender forms (Kaufmann/-frau, /-in, /-r), and drops joining particles (für, im, in, der, und, …).

Used by `build-availability.ts` and at runtime by `resolvePreferredJobs.ts` / the frontend's `preferredJobUtils.ts`.

**Example inputs → outputs**
```
normName("Erzieher/-in")                              →  "erzieher"
normName("Kaufmann/-frau - Einzelhandel")             →  "kaufmanneinzelhandel"
normName("Fachinformatiker/-in (Anwendungsentwickl.)")→  "fachinformatiker"
normName("Kaufmann/Kauffrau für Büromanagement")      →  "kaufmannbüromanagement"
normName("")                                          →  ""
```

---

## Standalone tools

### `vercel-build.mjs`

*Deploy.* Vercel Build Output API v3 producer. Runs the frontend build, bundles `api/_handler.ts` with esbuild into a serverless function, and writes `.vercel/output/`: static assets, function config, and routing rules (filesystem → API → SPA fallback). Invoked by Vercel — not wired to a root npm script.

**What it produces**
```
.vercel/output/
├── static/                          // frontend/dist copied in
│   ├── index.html
│   └── assets/…
├── functions/
│   └── api/[...route].func/
│       ├── index.mjs                // esbuild bundle of api/_handler.ts
│       └── .vc-config.json          // runtime: nodejs22.x, maxDuration: 60
└── config.json                      // routes:
                                     //   filesystem → /api/(.*) → /index.html
```

---

### `report-data-refresh.ts`

*Refresh PR body.* Diffs the committed `berufe.json` against the working copy and prints Markdown for the quarterly refresh PR opened by `.github/workflows/refresh-berufe.yml`: what BERUFENET added, removed and renamed, which fields churned, and which occupations still lack a popularity tier, an availability record or enrichment. Reads the stale-id lists from `data-refresh-summary.json`, which `fetch-berufe.ts` writes during the run. Exits 1 when more than 10 % of the previous catalog's occupations disappeared, which fails the workflow step before the PR is opened.

| | |
|---|---|
| **Runs** | `npx tsx scripts/report-data-refresh.ts > refresh-report.md` |
| **Reads** | `git show HEAD:backend/src/data/berufe.json`, the working `berufe.json`, `popularity-index.json`, `availability-by-state.json`, `data-refresh-summary.json` |
| **Writes** | nothing — Markdown on stdout |

**Example — the 2026-08-12 run**

```markdown
## BERUFENET refresh

Catalog: **538 → 534** (+2 / −6)

### Added — needs a suitability decision and a popularity tier
- `143399` Pflegefachassistent/in — accessLevel `hauptschule`, KldB `81301`

### Removed — check whether a successor exists under a new id
- `13741` Bauzeichner/in

| Field | Records changed |
| --- | --- |
| `descriptionLong` | 532 |
| `taskSummary` | 513 |
```

---

### `verify-cleanup.ts`

*Guard.* Read-only check: no §66/§42r name survived the exclusions, and `formatOccupationDisplayName` turns every `" - "` into one spaced en-dash — none digit-adjacent, none inside a compound word. Its §66 pattern is broader than `SECTION_66_NAME_RE`, so it catches names the exclusion regex misses. Worth re-running after every refresh.

| | |
|---|---|
| **Runs** | `npx tsx scripts/verify-cleanup.ts` |
| **Reads** | `berufe.json` (never writes) |

Sample OK output:
```
  Änderungsschneider/in
    -> Änderungsschneider/in
  Fachinformatiker/in - Anwendungsentwicklung
    -> Fachinformatiker/in – Anwendungsentwicklung
  ...

names with an en-dash separator: 287
OK — 528 occupations, no §66/§42r names, 287 names en-dashed cleanly.
```

Sample failure output:
```
FAILURES:
  - 2 §66/§42r names survived
  - digit-adjacent en-dash: Bauzeichner/in – 3D

exit 1
```
