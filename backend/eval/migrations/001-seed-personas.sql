-- backend/eval/migrations/001-seed-personas.sql
-- Seed data for the eval personas.
-- Run after 000-personas-schema.sql.
--
-- Active personas (7):
--   nico  — Hauptschule Kfz-dropout (in eval set)
--   elina — Realschule, 2nd-gen Bulgarian, helping+creative (in eval set)
--   karim — refugee from Lebanon, foreign_degree, A2 German (in eval set)
--   mia   — Realschule, sparse text, Salon Praktikum (NOT in eval set)
--   tom   — Realschule, gaming/anime/YouTube hobby (NOT in eval set)
--   hanna — Realschule, dual creative + care clusters (NOT in eval set)
--   noah  — vague aspirational low-signal Joblinge teen (NOT in eval set)
--
-- All tiers Joblinge-recalibrated. §66 BBiG / §42r HwO Fachpraktiker
-- variants are treated as first-class supported pathways for the
-- secondary/foreign_degree/none-edu audience, not as fallbacks.
--
-- Re-run-safe AND non-destructive: uses INSERT ... ON CONFLICT (id)
-- DO UPDATE for each persona. Re-running this file:
--   * updates the 7 personas listed here (name, description, profile,
--     tier arrays, criteria) to match this file's contents
--   * preserves `in_eval_set` if it was toggled in the admin UI
--     (column is deliberately NOT updated on conflict)
--   * leaves any GUI-created personas (rows whose id is NOT listed
--     here) completely untouched
--
-- NOTE (Karim criterion 3): The TS rubric uses firstResultFromSet() with a
-- custom 5-item set (not the full tierS ∪ tierA union), so the simple
-- first_from_s_a_union DSL type does not apply. It is mapped to
-- at_least_one_in_top_5 with those same IDs — this is a semantic downgrade
-- (top-1 guarantee → top-5 guarantee) flagged in the status report.
--
-- NOTE (Elina Tier C id 34975): The TS rubric maps "Bauten- und
-- Objektbeschichter" (not found in berufe.json) to Oberflächenbeschichter/in
-- (34975) with an inline author note. Transcribed as-is.


-- ============================================================
-- Persona 1: Nico B.
-- 18, Hauptschulabschluss, dropped Kfz-Mechatroniker after 4 months.
-- tierS: 8  tierA: 16  tierC: 93 (67 persona-specific + 26 universal)
-- criteria: 4
-- ============================================================

insert into personas (
  id,
  name,
  description,
  profile,
  tier_s,
  tier_a,
  tier_c,
  criteria,
  in_eval_set
) values (
  'nico',
  'Nico B.',
  '18, Hauptschulabschluss "mit Ach und Krach", started Kfz-Mechatroniker and quit after 4 months — too physical, shop too rough. Wants something hands-on but not a grind. Likes cars and tools, gym, YouTube auto-videos. Workshop-trauma is his strongest signal.',
  '{
    "inSchool": false,
    "educationLevel": "secondary",
    "favoriteSubjects": ["sports"],
    "customSubjects": [],
    "interests": ["videos", "screwing", "gym"],
    "customInterests": [],
    "workValues": ["good_salary", "stability"],
    "strengths": {
      "craftsmanship": 1,
      "perseverance": 0.5,
      "teamwork": 0.5
    },
    "secretTalent": "kann gut mit autos und werkzeug umgehen, nicht krass aber ich finds einfach, wo andere nicht weiterkommen",
    "practicalExperience": "hab 4 monate kfz-mechatroniker gemacht, war zu hart körperlich und der ton in der werkstatt war nichts für mich. hab aufgehört. will was wo man nicht den ganzen tag nur ackert",
    "workPreferences": {
      "environment": "a",
      "hands-vs-mind": "a",
      "people": "a",
      "pace": "a"
    },
    "noGos": {
      "heavy-work": "rejected",
      "noise": "rejected"
    }
  }'::jsonb,
  -- tier_s: 8 entries (v2 — expanded with Elektroniker family + §66 Lager; demoted FP Kfz-Mech to Tier A)
  ARRAY[
    27448,  -- Fachkraft - Lagerlogistik
    15540,  -- Fahrzeuglackierer/in
    14969,  -- Fachpraktiker/in für Fahrzeugpflege (§66 BBiG/§42r HwO)
    76430,  -- Industrieelektriker/in - Betriebstechnik
    15623,  -- Elektroniker/in - Betriebstechnik (A_anchor, ~8× Industrieelektriker)
    134719, -- Elektroniker/in - Maschinen und Antriebstechnik (BBiG)
    134718, -- Elektroniker/in - Maschinen und Antriebstechnik (HwO)
    4708    -- Fachpraktiker/in für Lagerlogistik (§66 BBiG/§42r HwO)
  ]::integer[],
  -- tier_a: 16 entries (v2 — added demoted FP Kfz-Mech §66, FP Elektroniker §66, Mechatroniker)
  ARRAY[
    27539,  -- Fachlagerist/in
    13794,  -- Berufskraftfahrer/in
    124409, -- Zweiradmechatroniker/in - Fahrradtechnik
    35283,  -- Mechatroniker/in - Kältetechnik
    29049,  -- Konstruktionsmechaniker/in
    132652, -- Maschinen- und Anlagenführer/in - Druckweiter- und Papierverarbeitung
    132657, -- Maschinen- und Anlagenführer/in - Lebensmitteltechnik
    132653, -- Maschinen- und Anlagenführer/in - Metall-, Kunststofftechnik
    132655, -- Maschinen- und Anlagenführer/in - Textiltechnik
    132656, -- Maschinen- und Anlagenführer/in - Textilveredelung
    124412, -- Land- und Baumaschinenmechatroniker/in
    14449,  -- Sport- und Fitnesskaufmann/-frau
    6622,   -- Automobilkaufmann/-frau
    2376,   -- Fachpraktiker/in für Kfz-Mechatroniker (§66 BBiG/§42r HwO) — demoted; trips both noGos
    2739,   -- Fachpraktiker/in für Elektroniker (§66 BBiG/§42r HwO)
    2868    -- Mechatroniker/in (noise=true is the only friction)
  ]::integer[],
  -- tier_c: 64 persona-specific + 26 universal niche bait = 90 entries
  ARRAY[
    -- His exact dropout (Kfz-Mechatroniker all Fachrichtungen)
    122564, -- Kraftfahrzeugmechatroniker/in - Karosserietechnik
    27300,  -- Kraftfahrzeugmechatroniker/in - Motorradtechnik
    27298,  -- Kraftfahrzeugmechatroniker/in - Nutzfahrzeugtechnik
    14799,  -- Kraftfahrzeugmechatroniker/in - Personenkraftwagentechnik
    122563, -- Kraftfahrzeugmechatroniker/in - System- und Hochvolttechnik
    -- Same domain, same heavy/noise
    137639, -- Karosserie- und Fahrzeugbaumechaniker/in - Caravan- und Reisemobiltechnik
    124530, -- Karosserie- und Fahrzeugbaumechaniker/in - Karosserie- und Fahrzeugbautechnik
    15166,  -- Karosserie- und Fahrzeugbaumechaniker/in - Karosserieinstandhaltungstechnik
    27442,  -- Mechaniker/in - Reifen- und Vulkanisationstechnik - Reifen- und Fahrwerktechnik
    27444,  -- Mechaniker/in - Reifen- und Vulkanisationstechnik - Vulkanisationstechnik
    -- Strongly customer-facing (conflicts with people:a)
    9910,   -- Friseur/in
    134513, -- Fachpraktiker/in für Friseur (§66 BBiG/§42r HwO)
    14624,  -- Kosmetiker/in (duale Ausbildung)
    9929,   -- Kosmetiker/in (schulische Ausbildung)
    680,    -- Florist/in
    93274,  -- Fachpraktiker/in in der Floristik (§66 BBiG/§42r HwO)
    10009,  -- Hotelfachmann/-frau
    136125, -- Fachmann/-frau - Restaurants und Veranstaltungsgastronomie
    9997,   -- Fachmann/-frau - Systemgastronomie
    70148,  -- Servicekraft - Schutz und Sicherheit
    6628,   -- Verkäufer/in
    6580,   -- Kaufmann/-frau - Einzelhandel
    -- Heavy/noise/grueling (his explicit noGos)
    4303,   -- Asphaltbauer/in
    139139, -- Hochbaufacharbeiter/in - Abbruch- und Betontrenntechnikarbeiten
    132714, -- Hochbaufacharbeiter/in - Beton- und Stahlbetonarbeiten
    132716, -- Hochbaufacharbeiter/in - Feuerungs- und Schornsteinbauarbeiten
    132715, -- Hochbaufacharbeiter/in - Maurerarbeiten
    132661, -- Tiefbaufacharbeiter/in - Brunnen- und Spezialtiefbauarbeiten
    132660, -- Tiefbaufacharbeiter/in - Gleisbauarbeiten
    132662, -- Tiefbaufacharbeiter/in - Kanalbauarbeiten
    139143, -- Tiefbaufacharbeiter/in - Kanalbauarbeiten für Infrastrukturtechnik
    139147, -- Tiefbaufacharbeiter/in - Leitungsbauarbeiten für Infrastrukturtechnik
    132663, -- Tiefbaufacharbeiter/in - Rohrleitungsbauarbeiten
    132659, -- Tiefbaufacharbeiter/in - Straßenbauarbeiten
    3938,   -- Maurer/in
    3980,   -- Beton- und Stahlbetonbauer/in
    129406, -- Dachdecker/in
    15164,  -- Anlagenmechaniker/in - Sanitär-, Heizungs- und Klimatechnik
    34941,  -- Industriekeramiker/in Anlagentechnik
    34948,  -- Industriekeramiker/in Dekorationstechnik
    34938,  -- Industriekeramiker/in Modelltechnik
    34943,  -- Industriekeramiker/in Verfahrenstechnik
    4279,   -- Industrie-Isolierer/in
    756,    -- Berg- und Maschinenmann/-frau - Transport und Instandhaltung
    757,    -- Berg- und Maschinenmann/-frau - Vortrieb und Gewinnung
    29055,  -- Industriemechaniker/in (A_anchor; trips both noGos)
    2277,   -- Metallbauer/in - Konstruktionstechnik (B_solid; trips both noGos)
    29047,  -- Anlagenmechaniker/in (B_solid; trips both noGos)
    -- Education mismatch (Realschule/Abitur expected in practice)
    14302,  -- Technische/r Assistent/in - Automatisierungstechnik
    5620,   -- Technische/r Assistent/in - Bautechnik
    2874,   -- Technische/r Assistent/in - medizinische Gerätetechnik
    6379,   -- Technische/r Assistent/in - Metallografie und Werkstoffkunde
    13625,  -- Technische/r Assistent/in - naturkundliche Museen und Forschungsinstitute
    33197,  -- Technische/r Assistent/in - regenerative Energietechnik und Energiemanagement
    14557,  -- Designer/in (Ausbildung) - angewandte Formgebung, Schmuck und Gerät
    14326,  -- Designer/in (Ausbildung) - Foto
    14217,  -- Designer/in (Ausbildung) - Grafik
    13968,  -- Designer/in (Ausbildung) - Kommunikationsdesign
    8459,   -- Designer/in (Ausbildung) - Medien
    14319,  -- Designer/in (Ausbildung) - Mode
    6515,   -- Gestaltungstechnische/r Assistent/in
    6415,   -- Lacklaborant/in
    -- Persona-specific niche bait (popularity Tier D/E)
    4432,   -- Polsterer/Polsterin
    122285, -- Stanz- und Umformmechaniker/in
    134333, -- Fahrzeuginterieur-Mechaniker/in
    35029,  -- Sattler/in - Fahrzeugsattlerei
    27394,  -- Fahrradmonteur/in
    -- Universal niche bait (string/bowed instruments)
    2673,   -- Geigenbauer/in
    124509, -- Zupfinstrumentenmacher/in - Gitarrenbau
    124510, -- Zupfinstrumentenmacher/in - Harfenbau
    2674,   -- Bogenmacher/in
    -- Universal niche bait (wind instruments)
    2687,   -- Holzblasinstrumentenmacher/in
    2665,   -- Metallblasinstrumentenmacher/in
    2694,   -- Handzuginstrumentenmacher/in
    -- Universal niche bait (keyboard/reed instruments)
    132536, -- Orgelbauer/in - Orgelbau
    132537, -- Orgelbauer/in - Pfeifenbau
    -- Universal niche bait (craft/artisan trades)
    130315, -- Bürsten- und Pinselmacher/in
    4539,   -- Böttcher/in
    1528,   -- Drechsler/in (Elfenbeinschnitzer/in) - Drechseln
    1539,   -- Drechsler/in (Elfenbeinschnitzer/in) - Elfenbeinschnitzen
    4640,   -- Vergolder/in
    -- Universal niche bait (gemstone/crystal)
    131163, -- Edelsteinschleifer/in - Edelsteingravieren
    131165, -- Edelsteinschleifer/in - Edelsteinschleifen
    131166, -- Edelsteinschleifer/in - Industriediamantschleifen
    131167, -- Edelsteinschleifer/in - Schmuckdiamantschleifen
    -- Universal niche bait (glass)
    1092,   -- Glasbläser/in - Christbaumschmuck
    1091,   -- Glasbläser/in - Glasgestaltung
    1095,   -- Glasbläser/in - Kunstaugen
    1088,   -- Leuchtröhrenglasbläser/in
    -- Universal niche bait (jewellery/precious metals)
    142202, -- Gold- und Silberschmied/in - Goldschmieden
    142203, -- Gold- und Silberschmied/in - Silberschmieden
    -- Universal niche bait (fur/pelts)
    3611,   -- Kürschner/in
    3602    -- Pelzveredler/in
  ]::integer[],
  -- criteria: 4
  '[
    {"type": "min_tier_s", "count": 3},
    {"type": "no_tier_c"},
    {"type": "first_from_s_a_union"},
    {
      "type": "at_least_one_in_top_5",
      "ids": [15540, 14969, 27448, 15623, 134719, 134718],
      "label": "Top 5 acknowledges Schrauben + no-heavy-no-noise direction (Lackierer / FP Fahrzeugpflege / Lagerlogistik / Elektroniker Betriebstechnik / Elektroniker Maschinen-Antriebstechnik)"
    }
  ]'::jsonb,
  true
)
on conflict (id) do update set
  name        = excluded.name,
  description = excluded.description,
  profile     = excluded.profile,
  tier_s      = excluded.tier_s,
  tier_a      = excluded.tier_a,
  tier_c      = excluded.tier_c,
  criteria    = excluded.criteria
  -- in_eval_set deliberately omitted: preserve admin-UI toggles on existing rows
;

-- ============================================================
-- Persona 2: Elina M.
-- 17, Realschule (letztes Schuljahr), 2nd-gen Bulgarian.
-- tierS: 7  tierA: 19  tierC: 77 (51 persona-specific + 26 universal)
-- criteria: 6
-- ============================================================

insert into personas (
  id,
  name,
  description,
  profile,
  tier_s,
  tier_a,
  tier_c,
  criteria,
  in_eval_set
) values (
  'elina',
  'Elina M.',
  '17, Realschule (letztes Schuljahr), 2nd-generation Bulgarian. Translates Behördenbriefe for her parents. Loves drawing and writing, unsure if she is good enough at either. Reflective and anxious about making the wrong choice; undecided between Ausbildung and Fachabitur.',
  '{
    "inSchool": true,
    "educationLevel": "intermediate",
    "favoriteSubjects": ["german", "art"],
    "customSubjects": [],
    "interests": ["drawing", "reading", "crafting", "helping"],
    "customInterests": [],
    "workValues": ["people_work", "autonomy_responsibility", "stability"],
    "strengths": {
      "creativity": 1,
      "communication": 1,
      "concentration": 0.5,
      "precision": 0.5
    },
    "secretTalent": "Ich übersetze seit Jahren Behördenbriefe und Arztgespräche für meine Eltern. Ich bin gut darin, schwierige Texte in einfache Sprache zu bringen.",
    "practicalExperience": "Ich habe bisher keine richtige Berufserfahrung. Manchmal helfe ich bei schulischen Projekten aus, und zuhause übernehme ich viel Verantwortung für meine jüngeren Geschwister. Ich weiß noch nicht genau, welchen Weg ich nehmen soll.",
    "workPreferences": {
      "environment": "a",
      "hands-vs-mind": "b",
      "people": "b",
      "variety": "b",
      "structure": "b"
    },
    "noGos": {
      "noise": "rejected",
      "dirt": "rejected"
    }
  }'::jsonb,
  -- tier_s: 7 entries (v2 — added ZFA as MFA sibling)
  ARRAY[
    9031,   -- Sozialassistent/in
    9162,   -- Erzieher/in
    9106,   -- Erzieher/in - Jugend- und Heimerziehung
    9170,   -- Sozialpädagogische/r Assistent/in / Kinderpfleger/in
    33212,  -- Medizinische/r Fachangestellte/r
    14704,  -- Zahnmedizinische/r Fachangestellte/r (MFA sibling, more Hauptschule-accessible)
    137684  -- Mediengestalter/in Digital und Print - Designkonzeption
  ]::integer[],
  -- tier_a: 19 entries (v2 — added Rechtsanwaltsfach, Verkäufer)
  ARRAY[
    132173, -- Pflegefachmann/-frau (Ausbildung)
    8779,   -- Ergotherapeut/in (Ausbildung)
    9127,   -- Heilerziehungspfleger/in
    8764,   -- Logopäde/Logopädin (Ausbildung)
    14217,  -- Designer/in (Ausbildung) - Grafik
    129408, -- Hörakustiker/in
    2634,   -- Augenoptiker/in
    6717,   -- Pharmazeutisch-kaufmännische/r Angestellte/r
    13749,  -- Buchhändler/in
    123266, -- Kaufmann/-frau - Büromanagement
    7573,   -- Steuerfachangestellte/r
    33214,  -- Tiermedizinische/r Fachangestellte/r
    7934,   -- Verwaltungsfachangestellte/r - Bundesverwaltung
    7933,   -- Verwaltungsfachangestellte/r - HWK und IHK
    7929,   -- Verwaltungsfachangestellte/r - Kirchenverwaltung - evangelische Kirche
    7944,   -- Verwaltungsfachangestellte/r - Kommunalverwaltung
    7925,   -- Verwaltungsfachangestellte/r - Landesverwaltung
    7958,   -- Rechtsanwaltsfachangestellte/r (translator-strength fit)
    6628    -- Verkäufer/in (prose-vs-list drift fix; lower-half only)
  ]::integer[],
  -- tier_c: 51 persona-specific + 26 universal niche bait = 77 entries
  ARRAY[
    -- Profile-conflict: heavy/dirty/loud (her explicit noGos)
    134955, -- Maler/in und Lackierer/in - Ausbautechnik und Oberflächengestaltung
    15532,  -- Maler/in und Lackierer/in - Bauten- und Korrosionsschutz
    134954, -- Maler/in und Lackierer/in - Energieeffizienz- und Gestaltungstechnik
    15530,  -- Maler/in und Lackierer/in - Gestaltung und Instandhaltung
    15534,  -- Maler/in und Lackierer/in - Kirchenmalerei und Denkmalpflege
    129406, -- Dachdecker/in
    15164,  -- Anlagenmechaniker/in - Sanitär-, Heizungs- und Klimatechnik
    4460,   -- Tischler/in
    29055,  -- Industriemechaniker/in
    29049,  -- Konstruktionsmechaniker/in
    132652, -- Maschinen- und Anlagenführer/in - Druckweiter- und Papierverarbeitung
    132657, -- Maschinen- und Anlagenführer/in - Lebensmitteltechnik
    132653, -- Maschinen- und Anlagenführer/in - Metall-, Kunststofftechnik
    132655, -- Maschinen- und Anlagenführer/in - Textiltechnik
    132656, -- Maschinen- und Anlagenführer/in - Textilveredelung
    139139, -- Hochbaufacharbeiter/in - Abbruch- und Betontrenntechnikarbeiten
    132714, -- Hochbaufacharbeiter/in - Beton- und Stahlbetonarbeiten
    132716, -- Hochbaufacharbeiter/in - Feuerungs- und Schornsteinbauarbeiten
    132715, -- Hochbaufacharbeiter/in - Maurerarbeiten
    132661, -- Tiefbaufacharbeiter/in - Brunnen- und Spezialtiefbauarbeiten
    132660, -- Tiefbaufacharbeiter/in - Gleisbauarbeiten
    132662, -- Tiefbaufacharbeiter/in - Kanalbauarbeiten
    139143, -- Tiefbaufacharbeiter/in - Kanalbauarbeiten für Infrastrukturtechnik
    139147, -- Tiefbaufacharbeiter/in - Leitungsbauarbeiten für Infrastrukturtechnik
    132663, -- Tiefbaufacharbeiter/in - Rohrleitungsbauarbeiten
    132659, -- Tiefbaufacharbeiter/in - Straßenbauarbeiten
    3938,   -- Maurer/in
    122564, -- Kraftfahrzeugmechatroniker/in - Karosserietechnik
    27300,  -- Kraftfahrzeugmechatroniker/in - Motorradtechnik
    27298,  -- Kraftfahrzeugmechatroniker/in - Nutzfahrzeugtechnik
    14799,  -- Kraftfahrzeugmechatroniker/in - Personenkraftwagentechnik
    122563, -- Kraftfahrzeugmechatroniker/in - System- und Hochvolttechnik
    27448,  -- Fachkraft - Lagerlogistik (no profile signal, heavy)
    27539,  -- Fachlagerist/in (no profile signal, heavy)
    9910,   -- Friseur/in (wrong creative read)
    -- Education mismatch in the wrong direction (Hauptschule-rough)
    4066,   -- Gerüstbauer/in
    756,    -- Berg- und Maschinenmann/-frau - Transport und Instandhaltung
    757,    -- Berg- und Maschinenmann/-frau - Vortrieb und Gewinnung
    34975,  -- Oberflächenbeschichter/in (= "Bauten- und Objektbeschichter" in rubric; nearest match)
    -- Elina-specific niche bait (fashion/design/fringe creative)
    27398,  -- Maßschneider/in
    126796, -- Textil- und Modeschneider/in
    33209,  -- Änderungsschneider/in
    14319,  -- Designer/in (Ausbildung) - Mode
    14326,  -- Designer/in (Ausbildung) - Foto
    13968,  -- Designer/in (Ausbildung) - Kommunikationsdesign
    8459,   -- Designer/in (Ausbildung) - Medien
    14869,  -- Gamedesigner/in (Ausbildung)
    8502,   -- Bühnenmaler/in und Bühnenplastiker/in - Malerei
    14080,  -- Bühnenmaler/in und Bühnenplastiker/in - Plastik
    59038,  -- Audiodesigner/in - Musik (Ausbildung)
    5924,   -- Bekleidungstechnische/r Assistent/in
    -- Universal niche bait (string/bowed instruments)
    2673,   -- Geigenbauer/in
    124509, -- Zupfinstrumentenmacher/in - Gitarrenbau
    124510, -- Zupfinstrumentenmacher/in - Harfenbau
    2674,   -- Bogenmacher/in
    -- Universal niche bait (wind instruments)
    2687,   -- Holzblasinstrumentenmacher/in
    2665,   -- Metallblasinstrumentenmacher/in
    2694,   -- Handzuginstrumentenmacher/in
    -- Universal niche bait (keyboard/reed instruments)
    132536, -- Orgelbauer/in - Orgelbau
    132537, -- Orgelbauer/in - Pfeifenbau
    -- Universal niche bait (craft/artisan trades)
    130315, -- Bürsten- und Pinselmacher/in
    4539,   -- Böttcher/in
    1528,   -- Drechsler/in (Elfenbeinschnitzer/in) - Drechseln
    1539,   -- Drechsler/in (Elfenbeinschnitzer/in) - Elfenbeinschnitzen
    4640,   -- Vergolder/in
    -- Universal niche bait (gemstone/crystal)
    131163, -- Edelsteinschleifer/in - Edelsteingravieren
    131165, -- Edelsteinschleifer/in - Edelsteinschleifen
    131166, -- Edelsteinschleifer/in - Industriediamantschleifen
    131167, -- Edelsteinschleifer/in - Schmuckdiamantschleifen
    -- Universal niche bait (glass)
    1092,   -- Glasbläser/in - Christbaumschmuck
    1091,   -- Glasbläser/in - Glasgestaltung
    1095,   -- Glasbläser/in - Kunstaugen
    1088,   -- Leuchtröhrenglasbläser/in
    -- Universal niche bait (jewellery/precious metals)
    142202, -- Gold- und Silberschmied/in - Goldschmieden
    142203, -- Gold- und Silberschmied/in - Silberschmieden
    -- Universal niche bait (fur/pelts)
    3611,   -- Kürschner/in
    3602    -- Pelzveredler/in
  ]::integer[],
  -- criteria: 6
  '[
    {"type": "min_tier_s", "count": 3},
    {
      "type": "subcategory_coverage",
      "subcategories": [
        {
          "name": "helping (schulisch)",
          "ids": [9031, 9162, 9106, 9170, 33212, 9127, 132173]
        },
        {
          "name": "creative/communication",
          "ids": [137684, 14217, 129408, 8764]
        }
      ],
      "label": "Top 8 covers helping and creative roles"
    },
    {"type": "no_tier_c"},
    {"type": "first_from_s_a_union"},
    {
      "type": "at_least_one_in_top_5",
      "ids": [9162, 9106, 8779, 8764, 9127],
      "label": "Acknowledges Fachabitur path (Erzieher / Ergotherapeut / Logopäde / Heilerziehungspfleger)"
    },
    {
      "type": "at_least_one_in_top_5",
      "ids": [137684, 14217, 129408],
      "label": "Hits creative/Kunst signal (Mediengestalter / Designer-Grafik / Hörakustiker)"
    }
  ]'::jsonb,
  true
)
on conflict (id) do update set
  name        = excluded.name,
  description = excluded.description,
  profile     = excluded.profile,
  tier_s      = excluded.tier_s,
  tier_a      = excluded.tier_a,
  tier_c      = excluded.tier_c,
  criteria    = excluded.criteria
  -- in_eval_set deliberately omitted: preserve admin-UI toggles on existing rows
;

-- ============================================================
-- Persona 3: Karim A.
-- 21, refugee from Lebanon (2015), no German Schulabschluss, A2 German.
-- tierS: 8  tierA: 19  tierC: 93 (67 persona-specific + 26 universal)
-- criteria: 4
-- ============================================================

insert into personas (
  id,
  name,
  description,
  profile,
  tier_s,
  tier_a,
  tier_c,
  criteria,
  in_eval_set
) values (
  'karim',
  'Karim A.',
  '21, came to Germany as a refugee from Lebanon in 2015. No German Schulabschluss, A2 German. Stated target: Einstiegsqualifizierung or Ausbildung in Logistik or Einzelhandel. Strong work ethic, team-oriented. The main barriers are language and not knowing the German training system.',
  '{
    "inSchool": false,
    "educationLevel": "foreign_degree",
    "favoriteSubjects": ["math", "sports"],
    "customSubjects": [],
    "interests": ["team", "gym", "outdoors", "building"],
    "customInterests": [],
    "workValues": ["good_salary", "stability", "short_distance"],
    "strengths": {
      "teamwork": 1,
      "perseverance": 1,
      "craftsmanship": 0.5,
      "concentration": 0.5
    },
    "secretTalent": "ich kann gut Sachen tragen und organisieren. in Lager oder Markt ich weiß wo alles ist. meine Freunde sagen ich bin sehr zuverlässig",
    "practicalExperience": "ich haben Integrationskurs gemacht und Sprachkurs. ich habe geholfen bei Umzug von Freunde, viel Kisten tragen und Möbel aufbauen. ich suche Ausbildung in Logistik oder Einzelhandel, ich will arbeiten",
    "workPreferences": {
      "environment": "a",
      "hands-vs-mind": "a",
      "location": "a",
      "people": "b",
      "pace": "b"
    },
    "noGos": {
      "computer": "rejected"
    }
  }'::jsonb,
  -- tier_s: 8 entries (v2 — promoted Einzelhandel + FK KEP)
  ARRAY[
    6628,   -- Verkäufer/in
    27448,  -- Fachkraft - Lagerlogistik
    27539,  -- Fachlagerist/in
    4708,   -- Fachpraktiker/in für Lagerlogistik (§66 BBiG/§42r HwO)
    6649,   -- Fachpraktiker/in im Verkauf (§66 BBiG/§42r HwO)
    3726,   -- Koch/Köchin
    6580,   -- Kaufmann/-frau - Einzelhandel (largest Ausbildung in DE; he named "Einzelhandel")
    33362   -- Fachkraft - Kurier-, Express- und Postdienstleistungen (highest noQ share; "tragen + organisieren")
  ]::integer[],
  -- tier_a: 20 entries (v2 — removed Kirchenmalerei → Tier C, added FP Maler/Lackierer §66 + Möbel-Umzug parent)
  ARRAY[
    10009,  -- Hotelfachmann/-frau
    50920,  -- Fachverkäufer/in - Lebensmittelhandwerk (Bäckerei)
    50924,  -- Fachverkäufer/in - Lebensmittelhandwerk (Fleischerei)
    50922,  -- Fachverkäufer/in - Lebensmittelhandwerk (Konditorei)
    134955, -- Maler/in und Lackierer/in - Ausbautechnik und Oberflächengestaltung
    15532,  -- Maler/in und Lackierer/in - Bauten- und Korrosionsschutz (heavy variant — soft fit only)
    134954, -- Maler/in und Lackierer/in - Energieeffizienz- und Gestaltungstechnik
    15530,  -- Maler/in und Lackierer/in - Gestaltung und Instandhaltung
    13794,  -- Berufskraftfahrer/in
    14463,  -- Fachkraft - Schutz und Sicherheit
    3626,   -- Bäcker/in
    13804,  -- Fleischer/in
    136126, -- Fachkraft - Gastronomie
    10088,  -- Fachpraktiker/in im Gastgewerbe (§66 BBiG/§42r HwO)
    14818,  -- Fachpraktiker/in im Nahrungsmittelverkauf (§66 BBiG/§42r HwO)
    3747,   -- Fachpraktiker/in Küche (Beikoch) (§66 BBiG/§42r HwO)
    77408,  -- Fachpraktiker/in für Möbel-, Küchen- und Umzugsservice (§66 BBiG/§42r HwO)
    34980,  -- Fachkraft - Möbel-, Küchen- und Umzugsservice (parent; literal "Möbel aufbauen" hit)
    4585    -- Fachpraktiker/in für Maler und Lackierer (§66 BBiG/§42r HwO)
  ]::integer[],
  -- tier_c: 66 persona-specific + 26 universal niche bait = 92 entries
  ARRAY[
    -- His explicit noGo: computer-heavy roles
    123266, -- Kaufmann/-frau - Büromanagement
    7965,   -- Industriekaufmann/-frau
    6755,   -- Bankkaufmann/-frau
    7573,   -- Steuerfachangestellte/r
    7934,   -- Verwaltungsfachangestellte/r - Bundesverwaltung
    7933,   -- Verwaltungsfachangestellte/r - HWK und IHK
    7929,   -- Verwaltungsfachangestellte/r - Kirchenverwaltung - evangelische Kirche
    7944,   -- Verwaltungsfachangestellte/r - Kommunalverwaltung
    7925,   -- Verwaltungsfachangestellte/r - Landesverwaltung
    7924,   -- Justizfachangestellte/r
    33212,  -- Medizinische/r Fachangestellte/r
    14704,  -- Zahnmedizinische/r Fachangestellte/r
    33214,  -- Tiermedizinische/r Fachangestellte/r
    8533,   -- Mediengestalter/in - Bild und Ton
    137684, -- Mediengestalter/in Digital und Print - Designkonzeption
    137682, -- Mediengestalter/in Digital und Print - Digitalmedien
    137683, -- Mediengestalter/in Digital und Print - Printmedien
    137685, -- Mediengestalter/in Digital und Print - Projektmanagement
    14557,  -- Designer/in (Ausbildung) - angewandte Formgebung, Schmuck und Gerät
    14326,  -- Designer/in (Ausbildung) - Foto
    14217,  -- Designer/in (Ausbildung) - Grafik
    13968,  -- Designer/in (Ausbildung) - Kommunikationsdesign
    8459,   -- Designer/in (Ausbildung) - Medien
    14319,  -- Designer/in (Ausbildung) - Mode
    90571,  -- Technische/r Produktdesigner/in - Maschinen- und Anlagenkonstruktion
    90588,  -- Technische/r Produktdesigner/in - Produktgestaltung und -konstruktion
    7856,   -- Fachinformatiker/in - Anwendungsentwicklung
    133556, -- Fachinformatiker/in - Daten- und Prozessanalyse
    133560, -- Fachinformatiker/in - Digitale Vernetzung
    7847,   -- Fachinformatiker/in - Systemintegration
    2927,   -- IT-System-Elektroniker/in
    7930,   -- Sozialversicherungsfachangestellte/r - allgemeine Krankenversicherung
    7936,   -- Sozialversicherungsfachangestellte/r - knappschaftliche Sozialversicherung
    7946,   -- Sozialversicherungsfachangestellte/r - landwirtschaftliche Sozialversicherung
    7931,   -- Sozialversicherungsfachangestellte/r - Rentenversicherung
    7932,   -- Sozialversicherungsfachangestellte/r - Unfallversicherung
    7958,   -- Rechtsanwaltsfachangestellte/r
    35279,  -- Kaufmann/-frau - Marketingkommunikation
    35311,  -- Kaufmann/-frau - Dialogmarketing
    29441,  -- Kaufmann/-frau - Spedition und Logistikdienstleistung
    -- Education / language barrier mismatch
    9162,   -- Erzieher/in
    9106,   -- Erzieher/in - Jugend- und Heimerziehung
    9170,   -- Sozialpädagogische/r Assistent/in / Kinderpfleger/in
    132173, -- Pflegefachmann/-frau (Ausbildung)
    8750,   -- Physiotherapeut/in (Ausbildung)
    8779,   -- Ergotherapeut/in (Ausbildung)
    8764,   -- Logopäde/Logopädin (Ausbildung)
    122462, -- Notfallsanitäter/in
    14302,  -- Technische/r Assistent/in - Automatisierungstechnik
    5620,   -- Technische/r Assistent/in - Bautechnik
    2874,   -- Technische/r Assistent/in - medizinische Gerätetechnik
    6379,   -- Technische/r Assistent/in - Metallografie und Werkstoffkunde
    13625,  -- Technische/r Assistent/in - naturkundliche Museen und Forschungsinstitute
    33197,  -- Technische/r Assistent/in - regenerative Energietechnik und Energiemanagement
    142962, -- Bautechnische/r Konstrukteur/in - Architektur
    142964, -- Bautechnische/r Konstrukteur/in - Ingenieurbau
    142963, -- Bautechnische/r Konstrukteur/in - Tief-, Verkehrswege- und Landschaftsbau
    13741,  -- Bauzeichner/in
    15534,  -- Maler/in und Lackierer/in - Kirchenmalerei und Denkmalpflege (55% Hochschulreife — Abi-leaning niche restoration, demoted from Tier A)
    -- Karim-specific niche bait (looks like Lager but unfindable)
    34996,  -- Fachkraft - Hafenlogistik
    76437,  -- Bergbautechnologe/-technologin - Tiefbautechnik
    76429,  -- Bergbautechnologe/-technologin - Tiefbohrtechnik
    4188,   -- Spezialtiefbauer/in
    756,    -- Berg- und Maschinenmann/-frau - Transport und Instandhaltung
    757,    -- Berg- und Maschinenmann/-frau - Vortrieb und Gewinnung
    4303,   -- Asphaltbauer/in
    27304,  -- Bauwerksmechaniker/in für Abbruch und Betontrenntechnik
    -- Universal niche bait (string/bowed instruments)
    2673,   -- Geigenbauer/in
    124509, -- Zupfinstrumentenmacher/in - Gitarrenbau
    124510, -- Zupfinstrumentenmacher/in - Harfenbau
    2674,   -- Bogenmacher/in
    -- Universal niche bait (wind instruments)
    2687,   -- Holzblasinstrumentenmacher/in
    2665,   -- Metallblasinstrumentenmacher/in
    2694,   -- Handzuginstrumentenmacher/in
    -- Universal niche bait (keyboard/reed instruments)
    132536, -- Orgelbauer/in - Orgelbau
    132537, -- Orgelbauer/in - Pfeifenbau
    -- Universal niche bait (craft/artisan trades)
    130315, -- Bürsten- und Pinselmacher/in
    4539,   -- Böttcher/in
    1528,   -- Drechsler/in (Elfenbeinschnitzer/in) - Drechseln
    1539,   -- Drechsler/in (Elfenbeinschnitzer/in) - Elfenbeinschnitzen
    4640,   -- Vergolder/in
    -- Universal niche bait (gemstone/crystal)
    131163, -- Edelsteinschleifer/in - Edelsteingravieren
    131165, -- Edelsteinschleifer/in - Edelsteinschleifen
    131166, -- Edelsteinschleifer/in - Industriediamantschleifen
    131167, -- Edelsteinschleifer/in - Schmuckdiamantschleifen
    -- Universal niche bait (glass)
    1092,   -- Glasbläser/in - Christbaumschmuck
    1091,   -- Glasbläser/in - Glasgestaltung
    1095,   -- Glasbläser/in - Kunstaugen
    1088,   -- Leuchtröhrenglasbläser/in
    -- Universal niche bait (jewellery/precious metals)
    142202, -- Gold- und Silberschmied/in - Goldschmieden
    142203, -- Gold- und Silberschmied/in - Silberschmieden
    -- Universal niche bait (fur/pelts)
    3611,   -- Kürschner/in
    3602    -- Pelzveredler/in
  ]::integer[],
  -- criteria: 4
  -- NOTE: criterion 3 uses at_least_one_in_top_5 instead of first_from_s_a_union
  -- because the TS rubric calls firstResultFromSet() with a custom 5-item set
  -- (not the full tierS ∪ tierA), and no first_from_custom_set DSL type exists.
  -- This is a semantic downgrade: checks top-5 presence rather than #1 position.
  '[
    {"type": "min_tier_s", "count": 4},
    {"type": "no_tier_c"},
    {
      "type": "at_least_one_in_top_5",
      "ids": [6628, 27448, 27539, 4708, 6649],
      "label": "Top result is Verkäufer / Fachkraft Lagerlogistik / Fachlagerist or Fachpraktiker variant"
    },
    {
      "type": "at_least_one_popularity_tier",
      "tier": "F_fachpraktiker",
      "label": "Top 8 includes a Fachpraktiker entry (acknowledges foreign-degree barrier)"
    }
  ]'::jsonb,
  true
)
on conflict (id) do update set
  name        = excluded.name,
  description = excluded.description,
  profile     = excluded.profile,
  tier_s      = excluded.tier_s,
  tier_a      = excluded.tier_a,
  tier_c      = excluded.tier_c,
  criteria    = excluded.criteria
  -- in_eval_set deliberately omitted: preserve admin-UI toggles on existing rows
;

-- ============================================================
-- Persona 4: Mia W.
-- 16, Realschule, in school. Sparse free text; only signal is a Salon-Praktikum.
-- Upper edge of Joblinge audience.
-- tierS: 5  tierA: 14  tierC: persona-specific + universal
-- ============================================================

insert into personas (
  id, name, description, profile, tier_s, tier_a, tier_c, criteria, in_eval_set
) values (
  'mia',
  'Mia W.',
  '16, Realschule, still in school. Almost no free-text input — just a Praktikum at her aunt''s hair salon. Indoor, hands-on, people-contact, fashion/helping/planning interests. The canonical low-signal user at the upper edge of the Joblinge audience.',
  '{
    "inSchool": true,
    "educationLevel": "intermediate",
    "favoriteSubjects": ["german", "art"],
    "customSubjects": [],
    "interests": ["fashion", "helping", "planning"],
    "customInterests": [],
    "workValues": ["people_work", "atmosphere"],
    "strengths": {
      "creativity": 0.5,
      "communication": 0.5,
      "teamwork": 0.5
    },
    "secretTalent": "weiß nicht",
    "practicalExperience": "Praktikum bei meiner Tante im Salon",
    "workPreferences": {
      "environment": "a",
      "hands-vs-mind": "a",
      "people": "b",
      "variety": "b"
    },
    "noGos": {
      "noise": "rejected",
      "dirt": "rejected"
    }
  }'::jsonb,
  -- tier_s: 5 entries (Joblinge-realistic anchors)
  ARRAY[
    9910,   -- Friseur/in (A_anchor, sec+noQ 59% — keystone)
    6628,   -- Verkäufer/in (A_anchor, sec+noQ 57%)
    33212,  -- Medizinische/r Fachangestellte/r (A_anchor, sec+noQ 28%)
    6580,   -- Kaufmann/-frau - Einzelhandel (A_anchor, sec+noQ 33%)
    134513  -- Fachpraktiker/in für Friseur (§66 BBiG/§42r HwO)
  ]::integer[],
  -- tier_a: 14 entries (v2 — added Kosmetiker schulische, FP Verkauf §66, FP Nahrungsmittelverkauf §66; demoted TFA to Tier C)
  ARRAY[
    10009,  -- Hotelfachmann/-frau
    50920,  -- Fachverkäufer/in - Lebensmittelhandwerk (Bäckerei)
    50922,  -- Fachverkäufer/in - Lebensmittelhandwerk (Konditorei)
    14704,  -- Zahnmedizinische/r Fachangestellte/r
    14624,  -- Kosmetiker/in (duale Ausbildung)
    2634,   -- Augenoptiker/in
    6717,   -- Pharmazeutisch-kaufmännische/r Angestellte/r
    123266, -- Kaufmann/-frau - Büromanagement
    680,    -- Florist/in
    9031,   -- Sozialassistent/in
    9063,   -- Altenpflegehelfer/in
    9929,   -- Kosmetiker/in (schulische Ausbildung) — was in fixture expectedHigh; rubric drift fix
    6649,   -- Fachpraktiker/in im Verkauf (§66)
    14818   -- Fachpraktiker/in im Nahrungsmittelverkauf (§66)
  ]::integer[],
  -- tier_c
  ARRAY[
    -- TFA demoted (sec+noQ=9%, Abi-cohort-leaning — was Tier A in v1 draft, wrong)
    33214,  -- Tiermedizinische/r Fachangestellte/r
    -- Profile-conflict (noise/dirt/heavy)
    134955, 15532, 134954, 15530, 15534,  -- Maler/Lackierer variants
    4460,   -- Tischler/in
    15164,  -- Anlagenmechaniker SHK
    29055,  -- Industriemechaniker
    29049,  -- Konstruktionsmechaniker
    132652, 132657, 132653, 132655, 132656, -- Maschinen- und Anlagenführer variants
    139139, 132714, 132716, 132715,  -- Hochbaufacharbeiter variants
    132661, 132660, 132662, 139143, 139147, 132663, 132659, -- Tiefbaufacharbeiter variants
    3938,   -- Maurer/in
    3980,   -- Beton- und Stahlbetonbauer/in
    129406, -- Dachdecker/in
    4066,   -- Gerüstbauer/in
    122564, 27300, 27298, 14799, 122563, -- Kfz-Mechatroniker variants
    27448,  -- Fachkraft - Lagerlogistik (no profile signal + heavy)
    27539,  -- Fachlagerist/in (no profile signal + heavy)
    756, 757,  -- Berg- und Maschinenmann variants
    -- Education / vibe mismatch
    7856, 7847, 133556, 133560,  -- Fachinformatiker variants (sec+noQ <5%, no signal)
    2927,   -- IT-System-Elektroniker/in
    8533, 137682, 137683, 137684, 137685,  -- Mediengestalter variants (no signal)
    14557, 14326, 14217, 13968, 8459, 14319,  -- Designer variants
    6755,   -- Bankkaufmann
    7965,   -- Industriekaufmann
    7573,   -- Steuerfachangestellte
    122462, -- Notfallsanitäter/in
    132173, -- Pflegefachmann/-frau
    9162,   -- Erzieher/in (Realschule+Fachschule stretch, no signal)
    -- Mia-specific niche bait (Salon-keyword traps)
    27398,  -- Maßschneider/in
    126796, -- Textil- und Modeschneider/in
    33209,  -- Änderungsschneider/in
    14869,  -- Gamedesigner/in
    8502, 14080,  -- Bühnenmaler/in variants
    -- Universal niche bait
    2673, 124509, 124510, 2674,
    2687, 2665, 2694,
    132536, 132537,
    130315, 4539, 1528, 1539, 4640,
    131163, 131165, 131166, 131167,
    1092, 1091, 1095, 1088,
    142202, 142203,
    3611, 3602
  ]::integer[],
  '[
    {"type": "min_tier_s", "count": 2},
    {"type": "no_tier_c"},
    {"type": "first_from_s_a_union"},
    {
      "type": "at_least_one_in_top_5",
      "ids": [9910],
      "label": "Friseur/in appears in top 8 (acknowledges Salon signal)"
    },
    {
      "type": "at_least_one_in_top_5",
      "ids": [6628, 6580, 10009, 33212],
      "label": "Top 5 anchors on a Joblinge-realistic baseline (Verkäufer / Einzelhandel / Hotelfach / MFA)"
    }
  ]'::jsonb,
  false
)
on conflict (id) do update set
  name        = excluded.name,
  description = excluded.description,
  profile     = excluded.profile,
  tier_s      = excluded.tier_s,
  tier_a      = excluded.tier_a,
  tier_c      = excluded.tier_c,
  criteria    = excluded.criteria
  -- in_eval_set deliberately omitted: preserve admin-UI toggles on existing rows
;

-- ============================================================
-- Persona 5: Tom B.
-- 16, Realschule. Gaming/anime/YouTube hobby vocabulary. Upper edge of
-- Joblinge audience.
-- tierS: 6  tierA: 12  tierC: persona-specific + universal
-- ============================================================

insert into personas (
  id, name, description, profile, tier_s, tier_a, tier_c, criteria, in_eval_set
) values (
  'tom',
  'Tom B.',
  '16, Realschule, in school. Free text dominated by gaming/anime/YouTube vocabulary (League of Legends, schneidet selbst Anime-Videos). Schülerpraktikum im Supermarkt ging "so". Tests whether the pipeline reads the video-editing skill, avoids Gamedesigner-bait, and anchors on Joblinge-realistic IT/office paths rather than Abi-clientele Mediengestalter alone.',
  '{
    "inSchool": true,
    "educationLevel": "intermediate",
    "favoriteSubjects": ["computer_science", "art"],
    "customSubjects": [],
    "interests": ["gaming", "computer", "videos"],
    "customInterests": [],
    "workValues": ["autonomy_responsibility", "atmosphere"],
    "strengths": {
      "creativity": 0.5,
      "concentration": 1,
      "precision": 0.5
    },
    "secretTalent": "Bin sehr gut in League of Legends, hab Platinum erreicht. Mache YouTube-Videos über Anime und schneide sie selbst.",
    "practicalExperience": "Bisher nichts wirklich. Schülerpraktikum im Supermarkt, ging so.",
    "workPreferences": {
      "environment": "a",
      "hands-vs-mind": "b",
      "people": "a",
      "pace": "a"
    },
    "noGos": {
      "heavy-work": "rejected",
      "outdoor-work": "rejected"
    }
  }'::jsonb,
  -- tier_s: 6 entries (v2 — added E-Commerce 130926; corrected from invalid IDs 37854/130249)
  ARRAY[
    130926, -- Kaufmann/-frau - E-Commerce (B_solid, sec+noQ 7% — stretch anchor)
    123266, -- Kaufmann/-frau - Büromanagement (A_anchor, sec+noQ 17%)
    2927,   -- IT-System-Elektroniker/in (B_solid, sec+noQ 9% — stretch anchor)
    8533,   -- Mediengestalter/in - Bild und Ton (video-editing direct hit)
    137038, -- Fachpraktiker/in für IT Systemintegration (§66 BBiG/§42r HwO)
    137683  -- Mediengestalter/in Digital und Print - Printmedien (sec+noQ 15%, most accessible Mediengestalter)
  ]::integer[],
  -- tier_a: 12 entries (v2 — added Digitalisierungsmanagement, Industriekaufmann)
  ARRAY[
    137682, -- Mediengestalter/in Digital und Print - Digitalmedien
    137684, -- Mediengestalter/in Digital und Print - Designkonzeption
    34976,  -- Fachpraktiker/in für IT Systemelektronik (§66 BBiG/§42r HwO)
    7883,   -- Fachpraktiker/in für Büromanagement (§66 BBiG/§42r HwO)
    7856,   -- Fachinformatiker/in - Anwendungsentwicklung (sec+noQ 4% — stretch)
    7847,   -- Fachinformatiker/in - Systemintegration (sec+noQ 5% — stretch)
    133556, -- Fachinformatiker/in - Daten- und Prozessanalyse (A_anchor, corrected from B_solid)
    133560, -- Fachinformatiker/in - Digitale Vernetzung (A_anchor, corrected from B_solid)
    35279,  -- Kaufmann/-frau - Marketingkommunikation
    137685, -- Mediengestalter/in Digital und Print - Projektmanagement
    133555, -- Kaufmann/-frau - Digitalisierungsmanagement (new bridge anchor)
    7965    -- Industriekaufmann/-frau (mainstream Realschule office anchor)
  ]::integer[],
  -- tier_c
  ARRAY[
    -- Mathematisch-tech Softwareentwickler: D_niche + 95% uni cohort, no math signal in profile
    51029,  -- Mathematisch-technische/r Softwareentwickler/in
    -- Profile-conflict (heavy / outdoor)
    122564, 27300, 27298, 14799, 122563,  -- Kfz-Mech variants
    29055, 29049,  -- Industrie-/Konstruktionsmechaniker
    132652, 132657, 132653, 132655, 132656,  -- Maschinen- und Anlagenführer
    139139, 132714, 132716, 132715,  -- Hochbau
    132661, 132660, 132662, 139143, 139147, 132663, 132659,  -- Tiefbau
    3938, 3980, 129406, 4066,  -- Maurer/Beton/Dach/Gerüst
    15164, 4460,  -- SHK/Tischler
    124412,  -- Land- und Baumaschinenmechatroniker
    13794,  -- Berufskraftfahrer
    756, 757,  -- Berg- und Maschinenmann
    27448, 27539,  -- Lagerlogistik / Fachlagerist (heavy + no signal)
    -- Tom-specific keyword traps
    14869,  -- Gamedesigner/in (THE bait)
    14557, 14326, 14217, 13968, 8459, 14319,  -- Designer variants
    8502, 14080,  -- Bühnenmaler variants
    59038,  -- Audiodesigner/in - Musik
    -- People/customer-facing (conflicts with people:a + Supermarkt-Praktikum negative)
    6628, 6580,  -- Verkäufer / Einzelhandel
    10009,  -- Hotelfachmann
    136125, 9997,  -- Restaurantfach / Systemgastronomie
    70148,  -- Servicekraft - Schutz und Sicherheit
    9910, 14624, 9929, 134513,  -- Friseur/Kosmetiker
    680,  -- Florist
    9162, 9106, 9170, 9031,  -- Erzieher/Sozialassistent
    132173, 9127,  -- Pflege/Heilerziehung
    33212, 14704, 33214,  -- MFA / ZFA / Tier-MFA
    6755,   -- Bankkaufmann
    -- Universal niche bait
    2673, 124509, 124510, 2674,
    2687, 2665, 2694,
    132536, 132537,
    130315, 4539, 1528, 1539, 4640,
    131163, 131165, 131166, 131167,
    1092, 1091, 1095, 1088,
    142202, 142203,
    3611, 3602
  ]::integer[],
  '[
    {"type": "min_tier_s", "count": 3},
    {"type": "no_tier_c"},
    {"type": "first_from_s_a_union"},
    {
      "type": "at_least_one_in_top_5",
      "ids": [130926, 123266, 2927, 8533, 137038, 137683, 137682, 137684, 34976, 7883, 7856, 7847],
      "label": "Top 5 contains an IT / Mediengestalter / §66 / Office / E-Commerce path"
    }
  ]'::jsonb,
  false
)
on conflict (id) do update set
  name        = excluded.name,
  description = excluded.description,
  profile     = excluded.profile,
  tier_s      = excluded.tier_s,
  tier_a      = excluded.tier_a,
  tier_c      = excluded.tier_c,
  criteria    = excluded.criteria
  -- in_eval_set deliberately omitted: preserve admin-UI toggles on existing rows
;

-- ============================================================
-- Persona 6: Hanna L.
-- 16, Realschule. Dual interest clusters (creative + care). Upper edge of
-- Joblinge audience.
-- tierS: 7  tierA: 15  tierC: persona-specific + universal
-- ============================================================

insert into personas (
  id, name, description, profile, tier_s, tier_a, tier_c, criteria, in_eval_set
) values (
  'hanna',
  'Hanna L.',
  '16, Realschule, in school. Two real interest clusters — creative (drawing, dance, music) and care (Altersheim volunteering, Babysitter). Honestly torn between them. Upper edge of the Joblinge audience. Tests whether the pipeline keeps both clusters represented and anchors care on Joblinge-realistic roles (Altenpflegehelfer, Sozialassistent) rather than on Fachhochschulreife-gated stretches (Erzieher, Ergotherapeut).',
  '{
    "inSchool": true,
    "educationLevel": "intermediate",
    "favoriteSubjects": ["art", "music", "biology"],
    "customSubjects": [],
    "interests": ["drawing", "dancing", "music", "helping"],
    "customInterests": [],
    "workValues": ["people_work", "atmosphere", "autonomy_responsibility"],
    "strengths": {
      "creativity": 1,
      "communication": 0.5,
      "empathy": 1,
      "teamwork": 0.5
    },
    "secretTalent": "Ich male und zeichne gerne, tanze in einer Gruppe, mache auch Musik. Außerdem helfe ich oft im Altersheim aus, meine Oma sagt ich bin sehr einfühlsam.",
    "practicalExperience": "Bisher nur Aushilfsjobs, mal als Babysitter, mal beim Bäcker. Ich weiß noch nicht genau, was ich will.",
    "workPreferences": {
      "environment": "a",
      "variety": "b",
      "people": "b",
      "structure": "b"
    },
    "noGos": {
      "heavy-work": "rejected",
      "dirt": "rejected"
    }
  }'::jsonb,
  -- tier_s: 7 entries (v2 — added Friseur as creative-handwerk anchor)
  ARRAY[
    9063,   -- Altenpflegehelfer/in (A_anchor, direct Altersheim hit)
    9170,   -- Sozialpädagogische/r Assistent/in / Kinderpfleger/in
    9031,   -- Sozialassistent/in
    30191,  -- Gesundheits- und Krankenpflegehelfer/in
    137683, -- Mediengestalter/in Digital und Print - Printmedien (most accessible)
    8533,   -- Mediengestalter/in - Bild und Ton (music hook)
    9910    -- Friseur/in (missing creative-handwerk + Hauptschule-floor anchor)
  ]::integer[],
  -- tier_a: 15 entries (v2 — added Fachverkäufer Bäckerei fixture hit, FP Gesundheitswesen §66)
  ARRAY[
    137684, -- Mediengestalter/in Digital und Print - Designkonzeption
    137682, -- Mediengestalter/in Digital und Print - Digitalmedien
    6515,   -- Gestaltungstechnische/r Assistent/in
    14217,  -- Designer/in (Ausbildung) - Grafik
    9127,   -- Heilerziehungspfleger/in
    9162,   -- Erzieher/in (Fachhochschulreife-path stretch)
    33212,  -- Medizinische/r Fachangestellte/r
    132173, -- Pflegefachmann/-frau
    8779,   -- Ergotherapeut/in (Fachhochschulreife stretch)
    8764,   -- Logopäde/Logopädin (Fachhochschulreife stretch)
    9106,   -- Erzieher/in - Jugend- und Heimerziehung
    129985, -- Fachpraktiker/in für Service in sozialen Einrichtungen (§66)
    14704,  -- Zahnmedizinische/r Fachangestellte/r
    50920,  -- Fachverkäufer/in - Lebensmittelhandwerk (Bäckerei) (literal fixture hit)
    138060  -- Fachpraktiker/in im Gesundheitswesen (§66)
  ]::integer[],
  -- tier_c
  ARRAY[
    -- Profile-conflict (heavy/dirty)
    134955, 15532, 134954, 15530, 15534,  -- Maler/Lackierer
    4460,  -- Tischler
    15164,  -- SHK
    122564, 27300, 27298, 14799, 122563,  -- Kfz-Mech
    29055, 29049,  -- Industrie-/Konstruktionsmech
    132652, 132657, 132653, 132655, 132656,  -- Maschinen-Anlagen
    139139, 132714, 132716, 132715,  -- Hochbau
    132661, 132660, 132662, 139143, 139147, 132663, 132659,  -- Tiefbau
    3938, 3980, 129406, 4066,  -- Maurer/Beton/Dach/Gerüst
    756, 757,  -- Berg- und Maschinenmann
    27448, 27539,  -- Lager (no signal + heavy)
    13794,  -- Berufskraftfahrer
    34941, 34948, 34938, 34943,  -- Industriekeramiker variants
    -- Education / wrong-direction mismatch
    14302, 5620, 2874, 6379, 13625, 33197,  -- Technische/r Assistent/in variants
    7856, 7847, 133556, 133560,  -- Fachinformatiker
    2927,   -- IT-System-Elektroniker
    6755, 7965,  -- Bank/Industriekaufmann
    -- Hanna-specific niche bait (creative & dance)
    14869,  -- Gamedesigner
    27398, 126796, 33209,  -- Schneider
    14319, 14326, 13968, 8459, 14557,  -- Designer variants
    8502, 14080,  -- Bühnenmaler variants
    59038,  -- Audiodesigner Musik
    5924,   -- Bekleidungstechnische/r Assistent/in
    -- Universal niche bait
    2673, 124509, 124510, 2674,
    2687, 2665, 2694,
    132536, 132537,
    130315, 4539, 1528, 1539, 4640,
    131163, 131165, 131166, 131167,
    1092, 1091, 1095, 1088,
    142202, 142203,
    3611, 3602
  ]::integer[],
  '[
    {"type": "min_tier_s", "count": 3},
    {
      "type": "subcategory_coverage",
      "subcategories": [
        {
          "name": "care (Joblinge-anchor)",
          "ids": [9063, 30191, 9031, 9170]
        },
        {
          "name": "creative",
          "ids": [137683, 8533, 137684, 137682, 6515, 14217, 9910]
        }
      ],
      "label": "Top 8 covers both clusters (creative AND Joblinge-anchored care)"
    },
    {"type": "no_tier_c"},
    {"type": "first_from_s_a_union"},
    {
      "type": "at_least_one_in_top_5",
      "ids": [9063, 30191, 9031, 9170],
      "label": "Top 5 contains a Joblinge-anchor care role (not only Erzieher/Ergotherapeut stretches)"
    }
  ]'::jsonb,
  false
)
on conflict (id) do update set
  name        = excluded.name,
  description = excluded.description,
  profile     = excluded.profile,
  tier_s      = excluded.tier_s,
  tier_a      = excluded.tier_a,
  tier_c      = excluded.tier_c,
  criteria    = excluded.criteria
  -- in_eval_set deliberately omitted: preserve admin-UI toggles on existing rows
;

-- ============================================================
-- Persona 7: Noah D.
-- 16, vague aspirational. No noGos, no preferences, no interests beyond
-- personality. Canonical low-signal Joblinge teen. Broad Tier S spanning
-- all anchor families.
-- tierS: 14  tierA: 12  tierC: persona-specific + universal
-- ============================================================

insert into personas (
  id, name, description, profile, tier_s, tier_a, tier_c, criteria, in_eval_set
) values (
  'noah',
  'Noah D.',
  '16, education level not stated. Vague aspirational — no concrete career direction. Only signal is personality (friendly, good listener, adaptable) plus "wants a good job that makes me happy and pays decently". The canonical low-signal Joblinge teen: vague, no plan, no clear constraints. Tests whether the pipeline produces hedged broad output (multiple direction families) rather than a confident specific direction.',
  '{
    "inSchool": false,
    "favoriteSubjects": [],
    "customSubjects": [],
    "interests": [],
    "customInterests": [],
    "workValues": ["good_salary"],
    "strengths": {},
    "secretTalent": "Ich bin freundlich und höre gut zu, kann mich gut anpassen.",
    "practicalExperience": "Will einen guten Job finden, der mich glücklich macht und ordentlich bezahlt. Habe noch keine richtige Erfahrung, bin erst 16.",
    "workPreferences": {},
    "noGos": {}
  }'::jsonb,
  -- tier_s: 14 entries (v2 — broadened to cover all anchor families equally + Friseur/ZFA from C-pass)
  ARRAY[
    6628,   -- Verkäufer/in
    50920,  -- Fachverkäufer/in - Lebensmittelhandwerk (Bäckerei)
    10009,  -- Hotelfachmann/-frau
    136126, -- Fachkraft - Gastronomie
    3726,   -- Koch/Köchin
    3626,   -- Bäcker/in
    13804,  -- Fleischer/in
    27448,  -- Fachkraft - Lagerlogistik
    27539,  -- Fachlagerist/in
    33212,  -- Medizinische/r Fachangestellte/r
    9063,   -- Altenpflegehelfer/in
    14463,  -- Fachkraft - Schutz und Sicherheit
    9910,   -- Friseur/in (personal-services anchor)
    14704   -- Zahnmedizinische/r Fachangestellte/r (MFA sibling)
  ]::integer[],
  -- tier_a: 12 entries (Realschule-leaning stretches + §66 paths)
  ARRAY[
    6580,   -- Kaufmann/-frau - Einzelhandel (Realschule-leaning)
    50922,  -- Fachverkäufer/in - Lebensmittelhandwerk (Konditorei)
    50924,  -- Fachverkäufer/in - Lebensmittelhandwerk (Fleischerei)
    9031,   -- Sozialassistent/in (Realschule-baseline)
    123266, -- Kaufmann/-frau - Büromanagement (sec+noQ 17%)
    6649,   -- Fachpraktiker/in im Verkauf (§66)
    4708,   -- Fachpraktiker/in für Lagerlogistik (§66)
    10088,  -- Fachpraktiker/in im Gastgewerbe (§66)
    3747,   -- Fachpraktiker/in Küche (Beikoch) (§66)
    14818,  -- Fachpraktiker/in im Nahrungsmittelverkauf (§66)
    7883,   -- Fachpraktiker/in für Büromanagement (§66)
    134513  -- Fachpraktiker/in für Friseur (§66)
  ]::integer[],
  -- tier_c: confident-direction picks + heavy/outdoor + universal niche bait
  ARRAY[
    -- Confident-direction picks unsupported by signal
    14869,  -- Gamedesigner
    8533, 137682, 137683, 137684, 137685,  -- Mediengestalter (no signal)
    7856, 7847, 133556, 133560,  -- Fachinformatiker (no signal)
    2927,   -- IT-System-Elektroniker
    14557, 14326, 14217, 13968, 8459, 14319,  -- Designer
    59038,  -- Audiodesigner
    122462, -- Notfallsanitäter (high-stress + Realschule+ + B2)
    9162, 9106,  -- Erzieher (Fachhochschulreife stretch)
    132173, -- Pflegefachmann (B2 + Realschule + heavy)
    8779, 8764,  -- Ergotherapeut / Logopäde (Fachhochschulreife)
    9127,   -- Heilerziehungspfleger
    6755, 7965,  -- Bank/Industriekaufmann (Abi-leaning, no signal)
    7573,   -- Steuerfachangestellte
    14302, 5620, 2874, 6379, 13625, 33197,  -- Technische/r Assistent/in variants
    -- Heavy/outdoor / direction default failures
    122564, 27300, 27298, 14799, 122563,  -- Kfz-Mech
    29055, 29049,  -- Industriemech
    139139, 132714, 132716, 132715,  -- Hochbau
    132661, 132660, 132662, 139143, 139147, 132663, 132659,  -- Tiefbau
    3938, 3980, 129406, 4066,  -- Maurer/Beton/Dach/Gerüst
    756, 757,  -- Berg-und-Maschinenmann
    -- Universal niche bait
    2673, 124509, 124510, 2674,
    2687, 2665, 2694,
    132536, 132537,
    130315, 4539, 1528, 1539, 4640,
    131163, 131165, 131166, 131167,
    1092, 1091, 1095, 1088,
    142202, 142203,
    3611, 3602
  ]::integer[],
  '[
    {"type": "min_tier_s", "count": 4},
    {"type": "no_tier_c"},
    {"type": "first_from_s_a_union"},
    {
      "type": "subcategory_coverage",
      "subcategories": [
        {
          "name": "retail",
          "ids": [6628, 6580, 50920, 50922, 50924, 6649]
        },
        {
          "name": "gastro / hospitality",
          "ids": [10009, 136126, 3726, 10088]
        },
        {
          "name": "logistics",
          "ids": [27448, 27539, 4708]
        },
        {
          "name": "food handwerk",
          "ids": [3626, 13804, 3747, 14818]
        },
        {
          "name": "helping-light",
          "ids": [33212, 14704, 9031, 9063]
        },
        {
          "name": "security",
          "ids": [14463]
        },
        {
          "name": "personal-services",
          "ids": [9910, 134513]
        }
      ],
      "label": "Top 8 spans ≥3 direction families (no single-family collapse)"
    }
  ]'::jsonb,
  false
)
on conflict (id) do update set
  name        = excluded.name,
  description = excluded.description,
  profile     = excluded.profile,
  tier_s      = excluded.tier_s,
  tier_a      = excluded.tier_a,
  tier_c      = excluded.tier_c,
  criteria    = excluded.criteria
  -- in_eval_set deliberately omitted: preserve admin-UI toggles on existing rows
;
