-- backend/eval/migrations/001-seed-personas.sql
-- Seed data for the three eval personas: Nico B., Elina M., Karim A.
-- Run after 000-personas-schema.sql.
--
-- Source: recovered from git HEAD (commit 89a7058) which retains the TS
-- fixture and rubric files as deleted-in-working-tree changes.
-- Recovered files:
--   shared/src/eval-fixtures/{nico,elina,karim}.ts
--   shared/src/eval-rubrics/{nico,elina,karim,universal-niche-bait}.ts
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
-- tierS: 5  tierA: 13  tierC: 90 (64 persona-specific + 26 universal)
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
    "workExpectations": ["good_salary", "stability"],
    "strengths": {
      "craftsmanship": 1,
      "perseverance": 0.5,
      "teamwork": 0.5
    },
    "customStrengths": ["kann gut mit autos und werkzeug umgehen, nicht krass aber ich finds einfach, wo andere nicht weiterkommen"],
    "selectedCustomStrengths": ["kann gut mit autos und werkzeug umgehen, nicht krass aber ich finds einfach, wo andere nicht weiterkommen"],
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
  -- tier_s: 5 entries
  ARRAY[
    27448,  -- Fachkraft - Lagerlogistik
    15540,  -- Fahrzeuglackierer/in
    14969,  -- Fachpraktiker/in für Fahrzeugpflege (§66 BBiG/§42r HwO)
    76430,  -- Industrieelektriker/in - Betriebstechnik
    2376    -- Fachpraktiker/in für Kfz-Mechatroniker (§66 BBiG/§42r HwO)
  ]::integer[],
  -- tier_a: 13 entries
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
    6622    -- Automobilkaufmann/-frau
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
      "ids": [15540, 14969, 2376, 27448],
      "label": "Top 5 acknowledges car/lager direction"
    }
  ]'::jsonb,
  true
);

-- ============================================================
-- Persona 2: Elina M.
-- 17, Realschule (letztes Schuljahr), 2nd-gen Bulgarian.
-- tierS: 6  tierA: 17  tierC: 77 (51 persona-specific + 26 universal)
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
    "workExpectations": ["people_work", "autonomy_responsibility", "stability"],
    "strengths": {
      "creativity": 1,
      "communication": 1,
      "concentration": 0.5,
      "precision": 0.5
    },
    "customStrengths": ["Ich übersetze seit Jahren Behördenbriefe und Arztgespräche für meine Eltern. Ich bin gut darin, schwierige Texte in einfache Sprache zu bringen."],
    "selectedCustomStrengths": ["Ich übersetze seit Jahren Behördenbriefe und Arztgespräche für meine Eltern. Ich bin gut darin, schwierige Texte in einfache Sprache zu bringen."],
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
  -- tier_s: 6 entries
  ARRAY[
    9031,   -- Sozialassistent/in
    9162,   -- Erzieher/in
    9106,   -- Erzieher/in - Jugend- und Heimerziehung
    9170,   -- Sozialpädagogische/r Assistent/in / Kinderpfleger/in
    33212,  -- Medizinische/r Fachangestellte/r
    137684  -- Mediengestalter/in Digital und Print - Designkonzeption
  ]::integer[],
  -- tier_a: 17 entries
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
    7925    -- Verwaltungsfachangestellte/r - Landesverwaltung
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
);

-- ============================================================
-- Persona 3: Karim A.
-- 21, refugee from Lebanon (2015), no German Schulabschluss, A2 German.
-- tierS: 6  tierA: 20  tierC: 92 (66 persona-specific + 26 universal)
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
    "workExpectations": ["good_salary", "stability", "short_distance"],
    "strengths": {
      "teamwork": 1,
      "perseverance": 1,
      "craftsmanship": 0.5,
      "concentration": 0.5
    },
    "customStrengths": ["ich kann gut Sachen tragen und organisieren. in Lager oder Markt ich weiß wo alles ist. meine Freunde sagen ich bin sehr zuverlässig"],
    "selectedCustomStrengths": ["ich kann gut Sachen tragen und organisieren. in Lager oder Markt ich weiß wo alles ist. meine Freunde sagen ich bin sehr zuverlässig"],
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
  -- tier_s: 6 entries
  ARRAY[
    6628,   -- Verkäufer/in
    27448,  -- Fachkraft - Lagerlogistik
    27539,  -- Fachlagerist/in
    4708,   -- Fachpraktiker/in für Lagerlogistik (§66 BBiG/§42r HwO)
    6649,   -- Fachpraktiker/in im Verkauf (§66 BBiG/§42r HwO)
    3726    -- Koch/Köchin
  ]::integer[],
  -- tier_a: 20 entries
  ARRAY[
    6580,   -- Kaufmann/-frau - Einzelhandel
    10009,  -- Hotelfachmann/-frau
    50920,  -- Fachverkäufer/in - Lebensmittelhandwerk (Bäckerei)
    50924,  -- Fachverkäufer/in - Lebensmittelhandwerk (Fleischerei)
    50922,  -- Fachverkäufer/in - Lebensmittelhandwerk (Konditorei)
    134955, -- Maler/in und Lackierer/in - Ausbautechnik und Oberflächengestaltung
    15532,  -- Maler/in und Lackierer/in - Bauten- und Korrosionsschutz
    134954, -- Maler/in und Lackierer/in - Energieeffizienz- und Gestaltungstechnik
    15530,  -- Maler/in und Lackierer/in - Gestaltung und Instandhaltung
    15534,  -- Maler/in und Lackierer/in - Kirchenmalerei und Denkmalpflege
    13794,  -- Berufskraftfahrer/in
    14463,  -- Fachkraft - Schutz und Sicherheit
    3626,   -- Bäcker/in
    13804,  -- Fleischer/in
    136126, -- Fachkraft - Gastronomie
    10088,  -- Fachpraktiker/in im Gastgewerbe (§66 BBiG/§42r HwO)
    14818,  -- Fachpraktiker/in im Nahrungsmittelverkauf (§66 BBiG/§42r HwO)
    3747,   -- Fachpraktiker/in Küche (Beikoch) (§66 BBiG/§42r HwO)
    77408,  -- Fachpraktiker/in für Möbel-, Küchen- und Umzugsservice (§66 BBiG/§42r HwO)
    34980   -- Fachkraft - Möbel-, Küchen- und Umzugsservice
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
);
