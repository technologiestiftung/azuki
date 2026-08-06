# Popularity source data

Input for `scripts/build-trainee-fixtures.ts`. The two xlsx snapshots are ~17 MB
of government statistics, so they are gitignored — download them once into this
directory (or set `POPULARITY_DATA_DIR` to wherever you keep them).

| File | Source |
|---|---|
| `dazubi-all-berufe-2024.xlsx` | BIBB DAZUBI 2024, <https://www.bibb.de/dazubi> → Auswertungen → Tabellen → "Alle Berufe nach Ländern". The script reads the sheet of that name. |
| `destatis-2024-25.xlsx` | Statistisches Bundesamt, Berufliche Schulen 2024/25, GENESIS-Online <https://www-genesis.destatis.de> → tables 21121-10, -11, -12, -13. The script reads sheets `csv-21121-10` … `csv-21121-13`. |

Both are yearly releases. When newer editions come out, drop them in under the
same filenames (or rename the constants in the script) and re-run:

```bash
npm run data:build-trainee-fixtures   # xlsx  → shared/data/{dazubi,destatis}-trainee-starts.json
npm run data:build-availability       # those → shared/data/availability-by-state.json
```

The generated JSON is committed, so the app builds without these xlsx present.
