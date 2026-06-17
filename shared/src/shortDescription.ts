import type { Occupation } from "./types";

export const SHORT_DESCRIPTION_PROMPT = `KURZDEFINITION PRO BERUF
Die Kurzdefinition erscheint auf der Ergebniskarte unter dem Berufstitel. Sie richtet sich an Jugendliche zwischen 15 und 25 Jahren, darunter viele mit eingeschränkten Deutschkenntnissen oder wenig Berufswissen. Schreibe deshalb so, als würdest du einem jungen Menschen kurz erklären, was man in diesem Job den ganzen Tag so macht.
Anforderungen:
- genau 1 Satz, maximal 15 Wörter
- beschreibe konkrete, alltägliche Tätigkeiten - was passiert wirklich in diesem Job?
- einfache, kurze Wörter - kein Fachjargon, keine Behördensprache
- Nominalstil erlaubt, aber nur mit alltagsnahen Begriffen (z. B. „Autos reparieren und warten" statt „Instandhaltung und Wartung von Kraftfahrzeugen")
- beginne NICHT mit der Berufsbezeichnung und wiederhole sie nicht (steht schon im Kartentitel)
- KEINE Ausbildungsinfos (kein Berufstyp, keine Ausbildungsart, -dauer oder Lernorte)
- NICHT die BERUFENET-Aufgabenbeschreibung kopieren oder kürzen
Gut — Beruf „Kauffrau/mann Büromanagement": Briefe schreiben, Termine planen und den Büroalltag organisieren.

Schlecht — zu abstrakt, Behördensprache: Organisation und Verwaltung von bürowirtschaftlichen Abläufen in Unternehmen und Institutionen.
Schlecht — Berufsbezeichnung wiederholt, zu lang, BERUFENET-Kopie: "Fachinformatiker/innen der Fachrichtung Systemintegration planen, installieren und betreiben IT-Systeme."`;

export function resolveOccupationShortDescription(
	occupation: Occupation,
): string {
	const fromCatalog = occupation.shortDescription?.trim();
	if (fromCatalog) {
		return fromCatalog;
	}
	return occupation.taskSummary?.trim() ?? "";
}
