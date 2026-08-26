# Scoring-Dokumentation

Wie aus den Antworten im Fragebogen die Berufsvorschläge entstehen.

## Pipeline

```
Katalog (538 Berufe)
  → Regionalfilter (Berlin + Brandenburg)        ~347 Kandidaten
  → Pre-Filter: regelbasierter Score je Beruf    Top 60
  → Wunschberufe in die Shortlist einsetzen      max. 5 Plätze
  → LLM-Re-Ranking (Claude Sonnet 4.6)           5–20 Berufe mit Begründung
  → Prozentwert monoton machen (isotone Regr.)   Reihenfolge bleibt vom LLM
```

- **Katalog**: 538 Berufe aus BERUFENET. §66/§42r-Fachpraktiker (Reha-Zielgruppe) und die von Joblinge als „nein"/„gelb" markierten Berufe sind entfernt (vorher 726).
- **Regionalfilter**: Berufe mit weniger als 5 neuen Ausbildungsverträgen bzw. Schüler:innen pro Jahr in Berlin + Brandenburg fallen raus (~191 Berufe). Berufe **ohne** Verfügbarkeitsdaten (27) bleiben drin — fehlende Daten sind kein Beleg für „gibt's nicht".
- **Pre-Filter**: jeder Kandidat bekommt einen Punktwert aus 10 Dimensionen (siehe unten), die besten 60 gehen weiter (`PREFILTER_TOP_K`).
- **Wunschberufe**: aufgelöste Wunschberufe, die der Score nicht in die Top 60 gehoben hat, verdrängen die schwächsten Einträge der Shortlist — höchstens 5 (`MAX_PREFERRED_SHORTLIST_INJECTIONS`, siehe „Wunschberufe").
- **LLM**: bewertet die 60 neu, gewichtet vor allem die Freitexte, und wählt 5–20 Berufe mit individueller Begründung aus. Ohne `OPENROUTER_API_KEY` oder bei einem Fehler werden die Top 20 des Pre-Filters mit Standard-Begründung zurückgegeben.

Das LLM entscheidet, **welche** Berufe in den Ergebnissen landen, wie sie begründet werden und **in welcher Reihenfolge**. Die Reihenfolge wird danach nicht mehr angefasst — auch Wunschberufe stehen dort, wo das LLM sie einsortiert hat.

Der Prozentwert **„Passt zu X %"** wird anschließend aus dem Pre-Filter-Score berechnet (`fitPercentages`). Weil das LLM keine eigene Zahl liefert, kann eine Karte weiter unten einen höheren Score haben als die darüber. Isotone Regression (Pool-Adjacent-Violators) löst das mit der kleinstmöglichen Änderung: Karten, die ohnehin passen, behalten ihren echten Wert; nur eine Folge, die die Reihenfolge tatsächlich verletzt, wird auf ihren Mittelwert zusammengelegt.

Eine Karte, die die Reihenfolge nicht verletzt, behält ihren **exakten** Wert — auch wenn er sich wiederholt. Zwei Berufe, die das Scoring gleich bewertet, sollen dieselbe Zahl zeigen. Nur **innerhalb** einer zusammengelegten Folge läuft der Wert abwärts, ein Punkt je zwei Karten (`REPEATS_PER_STEP`), damit eine lange Folge nicht zu einer einzigen Zahl zusammenfällt.

Diesen Abstieg steuert die LLM-Reihenfolge bei: Das Scoring kann die Berufe nicht trennen, das LLM hat sie gereiht, und der Prozentwert folgt dieser Reihung. Der Preis sind ein paar Prozentpunkte Genauigkeit innerhalb einer zusammengelegten Folge — gemessen an echten Ergebnislisten im Mittel 1–2 Punkte.

---

## Pre-Filter: die 10 Dimensionen

| Dimension              | Bandbreite                            | Kurz                           |
| ---------------------- | ------------------------------------- | ------------------------------ |
| Schulabschluss         | -15 … 0                               | Realitäts-Check, nur Abwertung |
| No-Gos                 | -5 je Treffer                         | Abgelehnte Arbeitsbedingungen  |
| Arbeitsvorlieben       | +2 je Treffer                         | 7 Slider                       |
| Schulfächer            | +1 je Treffer                         | Lieblingsfächer                |
| Interessen             | +3/+2/+1 je Kategorie, +3 Stichwörter | Hobbys                         |
| Praktische Erfahrungen | 0 … +8                                | Freitext-Stichwortabgleich     |
| Stärken                | +2 (stark) / +1 (etwas) je Treffer    | 8 Stärken                      |
| Rahmenbedingungen      | -2 … +3 je Auswahl                    | „Was ist dir wichtig?"         |
| Marktpräsenz           | -6 … +5                               | Findbarkeit der Ausbildung     |
| Wunschberufe           | 0 … +30 (max. +10 je Wunsch)          | Eigene Ausbildungswünsche      |

### Schulabschluss

Ohne Angabe wird konservativ **Hauptschulabschluss** angenommen (Joblinge-Zielgruppe).

**Primär — Abschlussverteilung der Berufstätigen** (BERUFENET a31-12, für 351 Berufe vorhanden):

| Abschluss der Nutzerin / des Nutzers      | Abwertung                                                                     |
| ----------------------------------------- | ----------------------------------------------------------------------------- |
| Haupt- / erw. Hauptschulabschluss         | **-10**, wenn < 10 % der Berufstätigen Hauptschulabschluss oder weniger haben |
| Realschulabschluss                        | **-5**, wenn < 10 % Realschulabschluss oder weniger haben                     |
| Ohne Abschluss                            | **-15**, wenn < 10 % ohne Abschluss sind                                      |
| Abitur / Fachabitur / Ausland / unbekannt | keine                                                                         |

**Fallback — gesetzliche Zugangsvoraussetzung** (a30-0), wenn keine Verteilung vorliegt (187 Berufe). Abstand zwischen gefordertem und vorhandenem Niveau: 1 Stufe = **-3**, 2 Stufen = **-12**. Ein Abschluss aus dem Ausland zählt hier wie Hauptschulniveau (praktische Realität ohne anerkanntes Zeugnis / B2-Deutsch).

Kein Beruf wird ausgeschlossen — nur abgewertet.

### No-Gos (-5 je Treffer)

Geprüft gegen die Arbeitsbedingungen (b16-3): Lärm, Schmutz, schweres Heben, Bildschirmarbeit, Schichtarbeit, Umgang mit Tieren, Unfallgefahr.

**Ausnahme Pflege/Pädagogik:** Bei „Lärm" und „Schwere körperliche Arbeit" wird die Strafe auf **-1** reduziert, wenn der Beruf primär sozial-beratend ist und keine Maschinen im Spiel sind. Jugendliche meinen mit diesen No-Gos typischerweise Werkstatt und Baustelle — sonst würden Erzieher, Pflegehelfer & Co. systematisch aus den Ergebnissen fallen.

### Arbeitsvorlieben (+2 je Treffer)

| Slider       | Seite a                                        | Seite b                                      |
| ------------ | ---------------------------------------------- | -------------------------------------------- |
| Umgebung     | Drinnen → drinnen                              | Draußen → draußen                            |
| Ort          | Fester Arbeitsort → drinnen                    | Viel unterwegs → draußen oder Baustelle      |
| Hände / Kopf | Praktisch arbeiten → Handarbeit oder Maschinen | Nachdenken und planen → Bildschirm oder Büro |
| Abwechslung  | Feste Abläufe → keine wechselnden Aufgaben     | Jeden Tag was Neues → wechselnde Aufgaben    |
| Menschen     | Meist alleine → kein Kundenkontakt             | Viel Kontakt → Kundenkontakt oder Teamarbeit |
| Tempo        | Immer viel zu tun → **kein Signal, +0**        | Entspanntes Tempo → Büroarbeit               |
| Struktur     | Aufgaben erledigen → kein Kreativ-Signal       | Neue Ideen entwickeln → Kreativ-Signal       |

„Kreativ-Signal" = Interessenkategorie kreativ-gestaltend, Stärke-Tag „Kreativität" oder Ästhetik-/Zeichen-Fähigkeiten (b20-2).

### Schulfächer (+1 je Treffer)

Abgleich mit den „wichtigen Schulfächern" des Berufs (a20-31). BERUFENET kennt nur das Sammelfach „Fremdsprachen"; beim Daten-Import wird es auf Französisch, Spanisch und „Andere Fremdsprachen" aufgefächert. Eigene Fächer (Freitext) werden nicht gescort, gehen aber ans LLM.

### Interessen

Alle ausgewählten Interessen (30 Chips) werden zu einem gemeinsamen Pool zusammengefasst und **einmal** gegen den Beruf geprüft — nicht einzeln.

**Tier 1 — BERUFENET-Interessenkategorie (b20-1).** Punkte nach Position der Kategorie beim Beruf: 1. Stelle **+3**, 2. Stelle **+2**, ab 3. Stelle **+1**. Jede Kategorie zählt nur einmal.

| Kategorie                                              | Interessen                                                                                                                                                            |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| theoretisch-abstrakt                                   | Gaming, Computer, Lesen                                                                                                                                               |
| kreativ-gestaltend                                     | Fotografieren, Videos, Zeichnen, Malen, Musik, Basteln, Mode & Styling, Tanzen                                                                                        |
| praktisch-konkret                                      | Basteln, Bauen, Schrauben, Backen, Kochen, Gärtnern, Tiere, Wandern, Camping, Draußen sein, Angeln, Fitness, Kampfsport, Tanzen, Radfahren, Skaten, Haustiere pflegen |
| sozial-beratend                                        | Tiere, Teamsport, Anderen helfen, Babysitten, Haustiere pflegen                                                                                                       |
| organisatorisch-prüfend + kaufmännisch-organisatorisch | Party planen                                                                                                                                                          |

Interessen in zwei Zeilen (z. B. Basteln) liefern Punkte für beide Kategorien.

**Tier 2 — Stichwörter.** Jedes Interesse bringt eigene Stichwörter mit (Kochen → `kochen`, `zubereiten`, `lebensmittel` …). Treffer gegen die Stichwörter des Berufs: +1 je Treffer, **max. +3** gesamt, damit Tier 2 Tier 1 nicht überholt.

Eigene Interessen (Freitext) werden nicht gescort, gehen aber ans LLM.

### Praktische Erfahrungen (max. +8)

Nur die vom Nutzer ausgewählten Einträge zählen. Je Eintrag:

`Stichworttreffer (max. 3) × 2 Punkte × Kategoriegewicht × Bewertungsfaktor`

- **Kategoriegewicht**: Praktikum/Job 1,0 · Schule/Verein 0,65 · zu Hause/Freunde 0,35 · ohne Auswahl 0,5
- **Bewertungsfaktor** (Sterne): 5★ 1,0 · 4★ 0,85 · 3★ 0 (neutral) · 2★ 0,25 · 1★ 0,1

Stichworttreffer = Überschneidung des Freitexts mit Berufsname, Interessen-Stichwörtern und Fähigkeits-Tags. Gesamtsumme auf **+8** gedeckelt — die Erfahrung soll die Shortlist verschieben, nicht dominieren.

### Stärken (100 % = +2, 50–99 % = +1)

Stärken unter 50 % geben keine Punkte.

| Stärke                 | Geprüft gegen                                                                                                   |
| ---------------------- | --------------------------------------------------------------------------------------------------------------- |
| Teamarbeit             | „Befähigung zu Gruppenarbeit / Teamfähigkeit" (b20-4)                                                           |
| Logisches Denken       | „Umsicht" (b20-4) oder „Numerisches Denken" (b20-2)                                                             |
| Kreativität            | „Kreativität" (b20-4) oder Ästhetik-/Zeichen-Tags (b20-2)                                                       |
| Kommunikation          | Kommunikationsfähigkeit / Kontaktbereitschaft (b20-4) oder mündliches / schriftliches Ausdrucksvermögen (b20-2) |
| Handwerklich geschickt | Handarbeit oder Maschinen (b16-3) oder „Fingergeschick" (b20-2)                                                 |
| Genaues Arbeiten       | Präzisionsarbeit (b16-3) oder „Beobachtungsgenauigkeit" (b20-2)                                                 |
| Konzentration          | „Konzentration" / „Daueraufmerksamkeit" (b20-2)                                                                 |
| Durchhalten            | „Durchhaltevermögen/Zielstrebigkeit" oder „Leistungs- und Einsatzbereitschaft" (b20-4)                          |

Primäre und sekundäre Quelle sind ODER-verknüpft, nicht kumulativ. Das „geheime Talent" (Freitext) wird nicht gescort, geht aber ans LLM.

### Rahmenbedingungen

| Auswahl                             | Logik                                                                                                                                                        |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Gutes Gehalt                        | Mediangehalt im oberen Drittel des Katalogs **+3**, mittleres Drittel **+1**, unteres **+0**. Schwellen werden bei jedem Match aus den Kandidaten berechnet. |
| Mit Menschen arbeiten               | Kundenkontakt oder Interesse sozial-beratend → **+2**                                                                                                        |
| Teamarbeit                          | Teamarbeit-Bedingung oder Team-Tag → **+2**                                                                                                                  |
| Selbstständigkeit und Verantwortung | „Selbstständige Arbeitsweise" oder „Verantwortungsbewusstsein" → **+2**                                                                                      |
| Sicherheit und Stabilität           | geregelte Abläufe UND keine Unfallgefahr UND keine unregelmäßigen Arbeitszeiten → **+2**                                                                     |
| Moderne Technologien                | Maschinenarbeit oder Digitalisierungssignal (b40-02) → **+2**                                                                                                |
| Kurzer Arbeitsweg                   | häufige Abwesenheit oder wechselnde Arbeitsorte → **-2**, sonst **+2**                                                                                       |
| Remote möglich                      | Arbeitsorte (b12-02) enthalten „Homeoffice" → **+2**                                                                                                         |
| Flexible Arbeitszeiten              | kein BERUFENET-Signal → **+0**, ans LLM delegiert                                                                                                            |
| Karriere                            | arbeitgeberabhängig, nicht ableitbar → **+0**, ans LLM delegiert                                                                                             |

### Marktpräsenz

Additiver Auf-/Abschlag nach Größe der Ausbildung (DAZUBI-Verträge bzw. Destatis-Schülerzahlen, `popularity-index.json`):

| Stufe                                  | Punkte | im Katalog |
| -------------------------------------- | ------ | ---------- |
| A — sehr beliebt (≥ 5.000 Starts/Jahr) | **+5** | 52         |
| B — etabliert                          | **+2** | 108        |
| C — klein, aber real                   | **0**  | 116        |
| D — Nische                             | **-3** | 86         |
| E — auslaufend                         | **-6** | 109        |
| Doppelqualifizierend                   | **0**  | 8          |
| Unbekannte Marktgröße                  | **-2** | 59         |

Die Spanne A→E (11 Punkte) reicht aus, um den typischen Abstand zwischen einem Nischenberuf mit gutem Profil-Match und einem populären mit dünnem Match zu kippen, ohne die Profilsignale zu überstimmen.

### Wunschberufe

Freitext-Angaben aus dem Schritt „Welche Ausbildung wünschst du dir?" (`profile.preferredJobs`). Jede Angabe wird gegen jeden Beruf aufgelöst; gewertet wird die **beste** Stufe über alle Angaben (`getBestPreferredJobTierForOccupation`).

| Stufe     | Bedingung (normalisierte Namen, `normName`)          | Punkte                                 |
| --------- | ---------------------------------------------------- | -------------------------------------- |
| exact     | Wunsch == Berufsname                                 | **+10**                                |
| substring | einer der beiden Namen enthält den anderen           | **+9**                                 |
| keyword   | Stichworttreffer im Berufsnamen / in Interessen-Tags | **+2 je Treffer, max. 4 Treffer (+8)** |

`normName` senkt die Schreibweise, entfernt Klammerzusätze, Füllwörter und die Gender-Schreibweisen des Katalogs (`Kaufmann/-frau`, `/-in`). Ausgeschriebene weibliche Formen fängt `preferredJobNormCandidates` zusätzlich ab, indem es die Endung „-in" abschneidet: „Kfz-Mechatronikerin" trifft „Kfz-Mechatroniker/-in" damit auf der exact-Stufe. Die keyword-Stufe fängt vage Eingaben wie „irgendwas mit Medien" ab: Tokens unter 4 Zeichen und Füllwörter (`KEYWORD_STOP_WORDS`) fliegen raus, gezählt werden nur exakte Term- oder Namenstreffer — „pflege" trifft also nicht „pflegen". Die Gesamtsumme ist auf **+30** gedeckelt (`PREFERRED_JOB_SCORE_CAP`) — bei den aktuellen Stufenwerten greift der Deckel nie.

**No-Gos heben den Wunsch nicht auf:** Ein Beruf mit negativem No-Go-Score bekommt den Wunsch-Bonus trotzdem und behält zugleich den No-Go-Abzug. Wer einen Beruf ausdrücklich nennt, soll ihn in der Liste sehen — nur eben ehrlich niedrig bewertet.

**Shortlist-Injection.** Der Boost allein reicht nicht immer, um einen schwach bewerteten Wunschberuf in die Top 60 zu heben. Deshalb werden aufgelöste Wunschberufe danach direkt eingesetzt: bis zu 5 (`MAX_PREFERRED_SHORTLIST_INJECTIONS`), jeweils auf den Platz des schwächsten Shortlist-Eintrags, No-Go-Berufe ausgenommen. Der Regionalfilter bleibt bindend — ein Wunschberuf, den es in Berlin/Brandenburg praktisch nicht gibt, kommt nicht zurück in die Liste.

Dieselbe Auflösung steuert die Stellensuche: die ersten 5 aufgelösten Wunschberufe stehen vor den Match-Ergebnissen in der Suchanfrage (`resolvePreferredJobVacancyNames`). Nur wenn nichts auflösbar war, wird der Rohtext als Suchbegriff genutzt.

---

## Was das LLM bekommt

**Profil** (nur ausgefüllte Felder): Schulstatus, Schulabschluss, Lieblingsfächer, Interessen, Stärken (≥ 50 % mit „stark"/„etwas"), „Eher nicht so gut in" (> 0 und < 50 %), Arbeitsvorlieben, Rahmenbedingungen, No-Gos, praktische Erfahrungen, gewünschte Ausbildungen — jeweils inklusive der Freitext-Ergänzungen.

**Je Beruf der Top 60**: Name, ID, Beschreibung (max. 400 Zeichen), Kompetenzen aus b20-32 (max. 400 Zeichen) und eine „Hinweise"-Zeile aus Marktpräsenz („Sehr beliebte Ausbildung (~20.000 Plätze/Jahr), im Alltag gut findbar") und Zugang („Zugang i.d.R. mit Realschulabschluss").

**Regeln im System-Prompt** (v5, Temperatur 0.3):

1. Harte Ausschlusskriterien (No-Gos, Abschluss-Realität) vor allem anderen.
2. Konkrete Freitext-Aussagen schlagen widersprechende strukturierte Felder — vage Freitexte nicht.
3. Bei dünnen Freitexten näher an der Pre-Filter-Reihenfolge bleiben.
4. Vielfalt: mehrere Richtungen statt fünf Varianten desselben Berufs, aber nie auf Kosten der Passung.
5. Marktpräsenz ist kein eigenes Auswahlkriterium, sondern Tiebreaker zwischen gleich gut passenden Berufen.
6. Lärm/schweres Heben als No-Go schließt Kleinkindpädagogik nicht aus.
7. Nur IDs aus der gelieferten Liste, jede Begründung in 2–4 einfachen Sätzen nach dem Muster Signal → Berufsaspekt → Passung.

Antworten, die sich nicht parsen lassen, ungültige oder doppelte IDs enthalten, werden gefiltert; bleiben weniger als 5 Berufe übrig, wird mit der Pre-Filter-Reihenfolge aufgefüllt.
