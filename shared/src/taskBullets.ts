import type { Occupation } from "./types";

export const TASK_BULLETS_PROMPT = `TYPISCHE AUFGABEN PRO BERUF
Auf der Berufsdetailseite erscheinen bis zu 4 Stichpunkte zu typischen Aufgaben. Sie richten sich an Jugendliche zwischen 15 und 25 Jahren, darunter viele mit eingeschränkten Deutschkenntnissen oder wenig Berufswissen. Schreibe deshalb so, als würdest du einem jungen Menschen kurz erklären, was man in diesem Job den ganzen Tag so macht.
Anforderungen:
- genau 2 bis 4 Stichpunkte
- jeder Stichpunkt: maximal 12 Wörter, eine konkrete Tätigkeit
- beschreibe konkrete, alltägliche Tätigkeiten - was passiert wirklich in diesem Job?
- einfache, kurze Wörter - kein Fachjargon, keine Behördensprache
- Nominalstil erlaubt, aber nur mit alltagsnahen Begriffen (z. B. „Autos reparieren" statt „Instandhaltung von Kraftfahrzeugen")
- beginne NICHT mit der Berufsbezeichnung und wiederhole sie nicht (steht schon im Kartentitel)
- KEINE Ausbildungsinfos (kein Berufstyp, keine Ausbildungsart, -dauer oder Lernorte)
- NICHT die BERUFENET-Aufgabenbeschreibung kopieren oder kürzen
- Stichpunkte decken verschiedene typische Aufgaben ab, keine Wiederholungen
Gut — Beruf „Kauffrau/mann Büromanagement":
- Briefe schreiben und E-Mails beantworten
- Termine planen und Kalender pflegen
- Rechnungen vorbereiten und ablegen
- Besucher empfangen und weiterleiten

Schlecht — zu abstrakt: Organisation und Verwaltung von bürowirtschaftlichen Abläufen
Schlecht — nur 1 Stichpunkt oder mehr als 4 Stichpunkte
Schlecht — BERUFENET-Kopie: "Planung, Installation und Betrieb von IT-Systemen"`;

const MAX_TASK_BULLETS = 4;

export function resolveOccupationTaskBullets(occupation: Occupation): string[] {
	const fromCatalog = occupation.taskBullets
		?.map((bullet) => bullet.trim())
		.filter(Boolean);
	if (fromCatalog && fromCatalog.length > 0) {
		return fromCatalog.slice(0, MAX_TASK_BULLETS);
	}
	return [];
}
