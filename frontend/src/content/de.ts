import { workPreferencePairs } from "./work-preference-pairs";

export const content = {
	// Common
	"common.multiSelect.subline": "Wähle alle aus, die zutreffen.",
	"common.singleSelect.subline": "Wähle eine Option aus.",
	"common.inputDialog.submitButtonLabel": "Hinzufügen",
	"common.inputDialog.submitButtonAriaLabel": "Hinzufügen",
	"common.inputDialog.cancelButtonLabel": "Abbrechen",
	"common.inputDialog.cancelButtonAriaLabel": "Abbrechen",
	"common.inputDialog.clearButtonAriaLabel": "Eingabe löschen",
	"common.inputDialog.errorMessage": "Bitte gib etwas ein",
	"common.bottomSheet.overlayDismissLabel": "Schließen",
	"common.bottomSheet.ariaLabel": "Dialog",
	// Welcome
	"welcome.slide.1.title": "Du suchst eine Ausbildung, die gut zu dir passt?",
	"welcome.slide.2.title": "Lerne deine Stärken kennen!",
	"welcome.slide.3.title": "Entdecke welche Ausbildungen zu dir passen",
	"welcome.slide.4.title": "Finde freie Plätze in deiner Nähe",
	"welcome.slide.ariaLabelPrefix": "Gehe zu Folie",
	"welcome.carousel.ariaLabel": "Folie {current} von {total}",
	"welcome.cta": "Ausbildung finden",

	// Start
	"start.title": "Zeig uns was dich besonders macht!",
	"start.description":
		"Wir stellen dir ein paar Fragen. In nur wenigen Minuten erhältst du dein eigenes Stärkenprofil und siehst Ausbildungen, die gut zu dir passen.",
	"start.cta": "Los geht's!",

	// In School
	"inSchool.question": "Gehst du zur Schule?",
	"inSchool.option.yes.label": "Ja",
	"inSchool.option.no.label": "Nein",

	// School Degree
	"schoolDegree.question": "Welchen Schulabschluss hast du?",
	"schoolDegree.question.inSchool": "Welchen Schulabschluss wirst du haben?",
	"schoolDegree.option.secondary.label": "Hauptschulabschluss (BBR)",
	"schoolDegree.option.extendedSecondary.label":
		"Erweiterter Hauptschulabschluss (eBBR)",
	"schoolDegree.option.intermediate.label": "Realschulabschluss (MSA)",
	"schoolDegree.option.universityEntrance.label": "Abitur",
	"schoolDegree.option.vocationalDiploma.label": "Fachabitur",
	"schoolDegree.option.none.label": "Ohne Abschluss",
	"schoolDegree.option.foreign.label": "Abschluss aus dem Ausland",
	"schoolDegree.option.unknown.label": "Ich weiß es nicht",
	"schoolDegree.skipButton.label": "Ich weiß es nicht",
	"schoolDegree.link.foreign.label": "Hilfe bei der Anerkennung",
	"schoolDegree.link.foreign.href":
		"https://www.berlin.de/sen/bjf/anerkennung/",

	// School Subjects
	"schoolSubjects.question": "Welche Schulfächer machen dir Spaß?",
	"schoolSubjects.skipButton.label": "Überspringen",
	"schoolSubjects.pill.label.postfix": "als lieblingsfach auswählen",
	"schoolSubjects.addCustomSubjectButton.label": "Schulfach hinzufügen",
	"schoolSubjects.addCustomSubjectButton.ariaLabel": "Schulfach hinzufügen",
	"schoolSubjects.customSubject.label": "Von dir hinzugefügt",
	"schoolSubjects.inputDialog.input.addPlaceholder": "Schulfach hinzufügen",
	"schoolSubjects.addCustomSubjectButton.addMore": "Weitere hinzufügen",
	//Languages
	"schoolSubjects.languages.label": "Sprachen",
	"schoolSubjects.languages.german.label": "Deutsch",
	"schoolSubjects.languages.german.icon": "🇩🇪",
	"schoolSubjects.languages.english.label": "Englisch",
	"schoolSubjects.languages.english.icon": "🇬🇧",
	"schoolSubjects.languages.other.label": "Andere Fremdsprachen",
	"schoolSubjects.languages.other.icon": "🌍",
	//MINT
	"schoolSubjects.mint.label": "Mathe, Natur und Technik",
	"schoolSubjects.mint.math.label": "Mathe",
	"schoolSubjects.mint.math.icon": "➗",
	"schoolSubjects.mint.physics.label": "Physik",
	"schoolSubjects.mint.physics.icon": "⚛️",
	"schoolSubjects.mint.biology.label": "Biologie",
	"schoolSubjects.mint.biology.icon": "🔬",
	"schoolSubjects.mint.chemistry.label": "Chemie",
	"schoolSubjects.mint.chemistry.icon": "🧪",
	"schoolSubjects.mint.computerScience.label": "Informatik",
	"schoolSubjects.mint.computerScience.icon": "💻",
	// Society & Economy
	"schoolSubjects.society.label": "Gesellschaft und Wirtschaft",
	"schoolSubjects.society.wat.label": "Wirtschaft-Arbeit-Technik (WAT)",
	"schoolSubjects.society.wat.icon": "🛠️",
	"schoolSubjects.society.homeEconomics.label": "Hauswirtschaftslehre",
	"schoolSubjects.society.homeEconomics.icon": "🍳",
	"schoolSubjects.society.ethicsReligion.label": "Ethik & Religion",
	"schoolSubjects.society.ethicsReligion.icon": "💭",
	"schoolSubjects.society.pedagogy.label": "Pädagogik",
	"schoolSubjects.society.pedagogy.icon": "🎓",
	"schoolSubjects.society.history.label": "Geschichte",
	"schoolSubjects.society.history.icon": "📜",
	"schoolSubjects.society.politics.label": "Politik",
	"schoolSubjects.society.politics.icon": "🗳️",
	"schoolSubjects.society.geography.label": "Geographie",
	"schoolSubjects.society.geography.icon": "🗺️",
	// Creativity
	"schoolSubjects.creativity.label": "Kreatives und Bewegung",
	"schoolSubjects.creativity.music.label": "Musik",
	"schoolSubjects.creativity.music.icon": "🎵",
	"schoolSubjects.creativity.art.label": "Kunst",
	"schoolSubjects.creativity.art.icon": "🎨",
	"schoolSubjects.creativity.performingArts.label": "Theater",
	"schoolSubjects.creativity.performingArts.icon": "🎭",
	// Sport
	"schoolSubjects.sports.sports.label": "Sport",
	"schoolSubjects.sports.sports.icon": "⚽️",

	// Interests
	"interests.question": "Was magst du gerne?",
	"interests.addedByYouLabel": "Von dir hinzugefügt",
	"interests.addPlaceholder": "Etwas anderes hinzufügen",
	"interests.skipButton.pill.label.postfix": "als Interesse auswählen",
	// Tech & Digital
	"interests.tech.label": "Technik & Digitales",
	"interests.tech.gaming.label": "Gaming",
	"interests.tech.gaming.icon": "🎮",
	"interests.tech.computer.label": "Computer",
	"interests.tech.computer.icon": "💻",
	"interests.tech.photography.label": "Fotografieren",
	"interests.tech.photography.icon": "📸",
	"interests.tech.videos.label": "Videos",
	"interests.tech.videos.icon": "🎥",
	// Creativity & Design
	"interests.creativity.label": "Kreatives & Gestalten",
	"interests.creativity.drawing.label": "Zeichnen",
	"interests.creativity.drawing.icon": "✏️",
	"interests.creativity.painting.label": "Malen",
	"interests.creativity.painting.icon": "🎨",
	"interests.creativity.music.label": "Musik",
	"interests.creativity.music.icon": "🎵",
	"interests.creativity.crafting.label": "Basteln",
	"interests.creativity.crafting.icon": "✂️",
	"interests.creativity.fashion.label": "Mode & styling",
	"interests.creativity.fashion.icon": "👗",
	// Craftsmanship & Practical
	"interests.practical.label": "Handwerk & Praktisches",
	"interests.practical.building.label": "Bauen",
	"interests.practical.building.icon": "🪚",
	"interests.practical.screwing.label": "Schrauben",
	"interests.practical.screwing.icon": "🔩",
	"interests.practical.backing.label": "Backen",
	"interests.practical.baking.icon": "🧁",
	"interests.practical.cooking.label": "Kochen",
	"interests.practical.cooking.icon": "🍳",
	"interests.practical.gardening.label": "Gärtnern",
	"interests.practical.gardening.icon": "🌱",
	// Nature, Animals & Outdoors
	"interests.nature.label": "Natur, Tiere & Draußen",
	"interests.nature.animals.label": "Mit Tieren sein",
	"interests.nature.animals.icon": "🐾",
	"interests.nature.hiking.label": "Wandern",
	"interests.nature.hiking.icon": "🥾",
	"interests.nature.camping.label": "Camping",
	"interests.nature.camping.icon": "🏕️",
	"interests.nature.outdoors.label": "Draußen sein",
	"interests.nature.outdoors.icon": "🌤️",
	"interests.nature.fishing.label": "Angeln",
	"interests.nature.fishing.icon": "🎣",
	// Sports & Movement
	"interests.sports.label": "Bewegung & Sport",
	"interests.sports.gym.label": "Fitness",
	"interests.sports.gym.icon": "🏋️",
	"interests.sports.team.label": "Teamsport",
	"interests.sports.team.icon": "⚽",
	"interests.sports.martialArts.label": "Kampfsport",
	"interests.sports.martialArts.icon": "🥋",
	"interests.sports.dancing.label": "Tanzen",
	"interests.sports.dancing.icon": "💃",
	"interests.sports.cycling.label": "Radfahren",
	"interests.sports.cycling.icon": "🚴",
	"interests.sports.skating.label": "Skaten",
	"interests.sports.skating.icon": "🛹",
	// People & Everyday Life
	"interests.people.label": "Menschen & Alltag",
	"interests.people.helping.label": "Anderen helfen",
	"interests.people.helping.icon": "🤝",
	"interests.people.read.label": "Lesen",
	"interests.people.read.icon": "📚",
	"interests.people.babysitting.label": "Babysitten",
	"interests.people.babysitting.icon": "🧸",
	"interests.people.petCare.label": "Haustiere pflegen",
	"interests.people.petCare.icon": "🐕",
	"interests.people.planning.label": "Party planen",
	"interests.people.planning.icon": "🎉",

	// Strengths
	"strengths.question": "Was kannst du gut?",
	"strengths.sliderMin": "0%",
	"strengths.sliderMax": "100%",
	"strengths.skipButton.label": "Überspringen",
	// Teamwork
	"strengths.cards.teamwork.title": "Teamarbeit",
	"strengths.cards.teamwork.description":
		"Ich arbeite mit anderen zusammen und spreche Aufgaben ab.",
	// Logical Thinking
	"strengths.cards.logical-thinking.title": "Logisches Denken",
	"strengths.cards.logical-thinking.description":
		"Wenn etwas nicht funktioniert, gehe ich Schritt für Schritt vor.",
	// Creativity
	"strengths.cards.creativity.title": "Kreativität",
	"strengths.cards.creativity.description":
		"Ich finde eigene Ideen oder neue Lösungen.",
	// Communication
	"strengths.cards.communication.title": "Kommunikation",
	"strengths.cards.communication.description":
		"Wenn ich etwas erkläre, verstehen andere mich. Ich höre anderen zu.",
	// Craftsmanship
	"strengths.cards.craftsmanship.title": "Handwerklich geschickt",
	"strengths.cards.craftsmanship.description":
		"Ich arbeite gern mit den Händen, zum Beispiel beim Bauen oder Reparieren.",
	// Concentration
	"strengths.cards.concentration.title": "Konzentration",
	"strengths.cards.concentration.description":
		"Ich bleibe bei einer Aufgabe, auch wenn es Ablenkung gibt.",
	// Precision
	"strengths.cards.precision.title": "Genaues Arbeiten",
	"strengths.cards.precision.description":
		"Ich arbeite sorgfältig und achte auf Details.",
	// Perseverance
	"strengths.cards.perseverance.title": "Durchhalten",
	"strengths.cards.perseverance.description":
		"Ich mache weiter, auch wenn eine Aufgabe anstrengend ist.",

	// Secret Talent
	"secretTalent.question":
		"Was kannst du richtig gut, von dem andere nichts wissen?",
	"secretTalent.placeholder": "Deine Eingabe",
	"secretTalent.cancelLabel": "Abbrechen",
	"secretTalent.saveLabel": "Speichern",

	// Practical Experience
	"practicalExperience.question": "Wo hast du schon Erfahrungen gesammelt?",
	"practicalExperience.subtitle":
		"Dabei geht es nicht nur um Praktikum und Jobs – auch Aufgaben im Alltag zählen!",
	"practicalExperience.placeholder": "Deine Eingabe",
	"practicalExperience.cancelLabel": "Abbrechen",
	"practicalExperience.saveLabel": "Speichern",

	//Work Values
	"workValues.question": "Was ist dir in deinem Beruf wichtig?",
	"workValues.skipButton.label": "Überspringen",
	"workValues.option.goodSalary": "Gutes Gehalt",
	"workValues.option.peopleWork": "Mit Menschen arbeiten",
	"workValues.option.teamWork": "Teamarbeit",
	"workValues.option.autonomyResponsibility":
		"Selbstständigkeit und Verantwortung",
	"workValues.option.flexibleHours": "Flexible Arbeitszeiten",
	"workValues.option.stability": "Sicherheit und Stabilität",
	"workValues.option.modernTechnology": "Arbeiten mit modernen Technologien",
	"workValues.option.shortDistance": "Kurzer Arbeitsweg",
	"workValues.option.career": "Karriere",
	"workValues.option.remote": "Remote möglich",

	// Work Preferences
	"workPreferences.question": "Wie möchtest du in Zukunft arbeiten?",
	"workPreferences.pairs": workPreferencePairs,
	"workPreferences.orLabel": "oder",

	// No-Gos
	"noGos.question": "Was geht für dich überhaupt nicht?",
	"noGos.rejectLabel": "Geht nicht",
	"noGos.ariaLabel.reject": "Als geht nicht markieren",
	"noGos.acceptLabel": "Ist okay",
	"noGos.ariaLabel.accept": "Als ist okay markieren",
	"noGos.skipButton.label": "Überspringen",
	//noise
	"noGos.noise.title": "Lärm",
	"noGos.noise.description": "z.B. Baustelle, Maschinen oder laute Werkstatt",
	//dirt
	"noGos.dirt.title": "Schmutz",
	"noGos.dirt.description": "z.B. Müll, Öl, Staub, starke Gerüche",
	//heavy-work
	"noGos.heavy-work.title": "Schwere körperliche Arbeit",
	"noGos.heavy-work.description":
		"z.B. schwer heben, lange stehen, viel tragen",
	//computer
	"noGos.computer.title": "Den ganzen Tag am Computer",
	"noGos.computer.description": "viel sitzen und am Bildschirm arbeiten",
	//shift-work
	"noGos.shift-work.title": "Schichtarbeit",
	"noGos.shift-work.description":
		"zu unterschiedlichen Zeiten arbeiten (z.B. morgens, abends, nachts)",
	//animals
	"noGos.animals.title": "Arbeit mit Tieren",
	"noGos.animals.description": "z.B. im Stall, Tierheim oder Tierarzt",
	//danger
	"noGos.danger.title": "Erhöhte Gefahr",
	"noGos.danger.description":
		"z.B. Arbeit mit Chemikalien, Starkstrom, in großer Höhe",

	// Navigation
	"navigation.next": "Weiter",
	"navigation.skip": "Ich weiß es nicht",
	"navigation.back": "Zurück",

	// Loading
	"loading.title": "Wir suchen die besten Ausbildungen für dich...",

	// Results
	"results.title": "Deine Ergebnisse",
	"results.tab.results": "Ausbildungsberufe",
	"results.tab.results.ariaLabel": "Zur Ausbildungsberufe-Ansicht",
	"results.tab.freeSpots": "Freie Plätze",
	"results.tab.freeSpots.ariaLabel": "Zur Freie Plätze-Ansicht",
	"results.bottomCard.title": "Kein passender Ausbildungsberuf dabei?",
	"results.bottomCard.resetCta": "Fragen wiederholen",
	"results.bottomCard.consultationCta": "Beratung anfragen",
	"results.bottomCard.consultationLink": "https://joblinge.de",
	"results.moreInfo": "Mehr erfahren",
	"results.restartCta": "Nochmal starten",
	"results.favorite.add": "Zu Favoriten hinzufügen",
	"results.favorite.remove": "Aus Favoriten entfernen",
	"results.card.score.label": "Passt zu",
	"results.occupationType.dual": "Dual",
	"results.occupationType.school": "Schulisch",
	// Filter Bottom Sheet
	"results.filter.title": "Filter",
	"results.filter.showFavorites": "Meine Favoriten anzeigen",
	"results.filter.occupationTypeSection": "Art des Berufs",
	"results.filter.reset": "Zurücksetzen",
	"results.filter.apply": "Anwenden",
	"results.filter.settingsAria": "Filtereinstellungen",
	"results.filter.dismissOverlay": "Schließen",

	// Skip confirm dialog
	"skipConfirmDialog.default.title": "Du hast noch nichts ausgewählt",
	"skipConfirmDialog.default.description":
		"Wenn du mehr auswählst, können wir dir passendere Berufe vorschlagen.",
	"skipConfirmDialog.confirm.selection": "Auswählen",
	"skipConfirmDialog.confirm.answerMultiple": "Fragen beantworten",
	"skipConfirmDialog.confirm.answerSingle": "Frage beantworten",
	"skipConfirmDialog.cancel": "Überspringen",
	"skipConfirmDialog.singleChoice.title": "Bitte wähle eine Option",
	"skipConfirmDialog.singleChoice.description":
		"Wenn du etwas auswählst, können wir dir passendere Berufe vorschlagen.",
	"skipConfirmDialog.multipleChoice.title": "Wähle eine oder mehrere Optionen",
	"skipConfirmDialog.multipleChoice.description":
		"Mehr Auswahl ermöglicht passendere Berufsvorschläge.",
	"skipConfirmDialog.skipAll.title": "Du hast alle Fragen übersprungen",
	"skipConfirmDialog.skipAll.description":
		"Beantworte möglichst viele Fragen, um passendere Berufsvorschläge zu erhalten.",
	"skipConfirmDialog.textInput.title": "Gib eine Antwort ein",
	"skipConfirmDialog.textInput.description":
		"Ergänze hier, was noch wichtig ist um passendere Berufsvorschläge zu erhalten.",
};
