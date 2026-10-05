# Popularity source data

- `dazubi-all-berufe-2024.xlsx`: unmodified BIBB DAZUBI download (see [NOTICE](../../NOTICE)), sha256 pinned in `dazubi-source.json`. `npm install` and the Vercel build turn it into `shared/data/popularity-index.json` and `availability-by-state.json`. Both are gitignored: the licence forbids sharing derived data.
- `destatis-2024-25.xlsx`: gitignored, only needed to rebuild the committed `shared/data/destatis-trainee-starts.json`.

## Refreshing BIBB DAZUBI

1. Download <https://www.bibb.de/dokumente/xls/dazubi_zusatztabellen_alle-dualen-berufe_indikatoren_aktuelles-bj.xlsx> as `dazubi-all-berufe-<JAHR>.xlsx` and delete the old file.
2. Update `dazubi-source.json` and the year/filename in `NOTICE` and `PopularityExplainer.tsx`.
3. Run `npm run data:build-dazubi`, update the tier counts and "Stand" in `backend/src/matching/SCORING.md`, and update tests pinned to the old values.

## Refreshing Destatis

Download „Berufliche Schulen und Schulen des Gesundheitswesens – Berufsbezeichnungen" from the [Destatis Statistische Berichte](https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Bildung-Forschung-Kultur/Schulen/Publikationen/_publikationen-innen-statistischer-bericht.html), save it as `destatis-<YYYY-YY>.xlsx`, update `DESTATIS_XLSX` in `scripts/build-destatis-fixture.ts`, then run `npm run data:build-destatis-fixture` and `npm run data:build-dazubi`.
