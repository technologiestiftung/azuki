export const content = {
	welcome: {
		slides: [
			{
				title: "Du suchst eine Ausbildung, die gut zu dir passt?",
			},
			{
				title: "Entdecke welche Ausbildungen zu dir passen",
			},
			{
				title: "Finde freie Plätze in deiner Nähe",
			},
			{
				title: "Lerne deine Stärken kennen!",
			},
		],
		cta: "Ausbildung finden",
	},

	start: {
		heading: "Zeig uns was dich besonders macht!",
		body: "Wir stellen dir ein paar Fragen. Danach zeigen wir dir Ausbildungen, die gut zu dir passen.",
		cta: "Los geht's!",
	},

	inSchool: {
		question: "Gehst du zur Schule?",
		options: [
			{ value: "yes", label: "Ja" },
			{ value: "no", label: "Nein" },
		],
	},

	schoolDegree: {
		question: "Welchen Schulabschluss hast du?",
		options: [
			{ value: "hauptschule", label: "Hauptschulabschluss" },
			{ value: "erweitert_hauptschule", label: "Erweiterter Hauptschulabschluss" },
			{ value: "realschule", label: "Realschulabschluss" },
			{ value: "ohne_abschluss", label: "Ohne Abschluss" },
			{ value: "abitur", label: "Abitur" },
		],
		unknownLabel: "Ich weiß es nicht",
	},

	schoolSubjects: {
		question: "Welche Schulfächer machen dir Spaß?",
		categories: [
			{
				name: "Sprachen",
				subjects: ["Deutsch", "Englisch", "Andere Fremdsprachen"],
			},
			{
				name: "Naturwissenschaften",
				subjects: ["Mathe", "Physik", "Chemie", "Biologie"],
			},
			{
				name: "Gesellschaft & Wirtschaft",
				subjects: ["Wirtschaft", "Ethik", "Religion"],
			},
			{
				name: "Praxis & Kreativität",
				subjects: ["Werken/Technik", "Informatik", "Kunst", "Musik", "Sport"],
			},
		],
	},

	interests: {
		question: "Was machst du gerne?",
		addedByYouLabel: "Von dir hinzugefügt",
		addPlaceholder: "Etwas anderes hinzufügen",
		categories: [
			{
				name: "Technik & Digitales",
				items: [
					{ label: "Gaming", icon: "🎮" },
					{ label: "Computer", icon: "💻" },
					{ label: "Fotografieren", icon: "📸" },
					{ label: "Videos", icon: "🎥" },
				],
			},
			{
				name: "Kreatives & Gestalten",
				items: [
					{ label: "Zeichnen", icon: "🎨" },
					{ label: "Musik", icon: "🎵" },
					{ label: "Basteln", icon: "✂️" },
					{ label: "Schreiben", icon: "✍️" },
				],
			},
			{
				name: "Handwerk & Praktisches",
				items: [
					{ label: "Bauen", icon: "🔨" },
					{ label: "Reparieren", icon: "🔧" },
					{ label: "Kochen", icon: "🍳" },
					{ label: "Gärtnern", icon: "🌱" },
				],
			},
			{
				name: "Natur, Tiere & Draußen",
				items: [
					{ label: "Tiere", icon: "🐾" },
					{ label: "Wandern", icon: "🥾" },
					{ label: "Natur", icon: "🌿" },
					{ label: "Sport", icon: "⚽" },
				],
			},
			{
				name: "Menschen & Alltag",
				items: [
					{ label: "Anderen helfen", icon: "🤝" },
					{ label: "Organisieren", icon: "📋" },
					{ label: "Verkaufen", icon: "🛒" },
					{ label: "Kinder betreuen", icon: "👶" },
				],
			},
		],
	},

	strengths: {
		question: "Was kannst du gut?",
		cards: [
			{
				id: "teamwork",
				title: "Teamarbeit",
				description: "Ich arbeite mit anderen zusammen und spreche Aufgaben ab.",
				illustration: "/illustrations/teamwork.svg",
			},
			{
				id: "logical-thinking",
				title: "Logisches Denken",
				description: "Wenn etwas nicht funktioniert, gehe ich Schritt für Schritt vor.",
				illustration: "/illustrations/logical-thinking-container.svg",
			},
			{
				id: "creativity",
				title: "Kreativität",
				description: "Ich finde eigene Ideen oder neue Lösungen.",
				illustration: "/illustrations/craftsmanship.svg",
			},
			{
				id: "communication",
				title: "Kommunikation",
				description: "Wenn ich etwas erkläre, verstehen andere mich. Ich höre anderen zu.",
				illustration: "/illustrations/communication.svg",
			},
			{
				id: "craftsmanship",
				title: "Handwerklich geschickt",
				description: "Ich arbeite gern mit den Händen, zum Beispiel beim Bauen oder Reparieren.",
				illustration: "/illustrations/craftsmanship.svg",
			},
			{
				id: "concentration",
				title: "Konzentration",
				description: "Ich bleibe bei einer Aufgabe, auch wenn es Ablenkung gibt.",
				illustration: "/illustrations/concentration.svg",
			},
			{
				id: "precision",
				title: "Genaues Arbeiten",
				description: "Ich arbeite sorgfältig und achte auf Details.",
				illustration: "/illustrations/precise-work.svg",
			},
			{
				id: "perseverance",
				title: "Durchhalten",
				description: "Ich mache weiter, auch wenn eine Aufgabe anstrengend ist.",
				illustration: "/illustrations/concentration-alt.svg",
			},
		],
		sliderMin: "Gar nicht",
		sliderMax: "100%",
	},

	secretTalent: {
		question: "Was kannst du richtig gut, von dem andere nichts wissen?",
		placeholder: "Deine Eingabe",
		cancelLabel: "Abbrechen",
		saveLabel: "Speichern",
	},

	practicalExperience: {
		question: "Wo hast du schon Erfahrungen gesammelt?",
		subtitle: "Dabei geht es nicht nur um Praktikum und Jobs – auch Aufgaben im Alltag zählen!",
		placeholder: "Deine Eingabe",
		cancelLabel: "Abbrechen",
		saveLabel: "Speichern",
	},

	workPreferences: {
		question: "Wie möchtest du in Zukunft arbeiten?",
		pairs: [
			{ id: "location", a: "Immer am gleichen Ort", b: "Oft unterwegs" },
			{ id: "hands-vs-mind", a: "Mit den Händen arbeiten", b: "Mit dem Kopf arbeiten" },
			{ id: "variety", a: "Immer die gleichen Aufgaben", b: "Immer andere Aufgaben" },
			{ id: "people", a: "Wenig Kontakt mit Menschen", b: "Viel Kontakt mit Menschen" },
			{ id: "pace", a: "Ruhige Arbeit", b: "Arbeit unter Zeitdruck" },
			{ id: "structure", a: "Feste Regeln", b: "Viel Freiheit" },
			{ id: "purpose", a: "Anderen helfen", b: "Aufgaben erledigen" },
			{ id: "environment", a: "Drinnen", b: "Draußen" },
		],
		orLabel: "oder",
	},

	noGos: {
		question: "Was geht für dich überhaupt nicht?",
		cards: [
			{
				id: "noise",
				title: "Arbeit mit Lärm",
				description: "z. B. Baustelle, Maschinen oder laute Werkstatt",
				illustration: "/illustrations/noise.svg",
			},
			{
				id: "dirt",
				title: "Schmutz bei der Arbeit",
				description: "z. B. Müll, Öl, Staub oder starke Gerüche",
				illustration: "/illustrations/dirty-work.svg",
			},
			{
				id: "heavy-work",
				title: "Schwere körperliche Arbeit",
				description: "z. B. schwer heben, lange stehen, viel tragen",
				illustration: "/illustrations/heavy-work.svg",
			},
			{
				id: "computer",
				title: "Den ganzen Tag am Computer",
				description: "viel sitzen und am Bildschirm arbeiten",
				illustration: "/illustrations/computer.svg",
			},
			{
				id: "shift-work",
				title: "Schicht- oder Nachtarbeit",
				description: "wechselnde Arbeitszeiten, auch sehr früh oder spät",
				illustration: "/illustrations/shift-work.svg",
			},
			{
				id: "animals",
				title: "Arbeit mit Tieren",
				description: "z. B. im Stall, Tierheim oder Tierarzt",
				illustration: "/illustrations/animals.svg",
			},
			{
				id: "danger",
				title: "Gefährliche Arbeit",
				description: "z. B. mit Chemikalien, Strom oder großer Höhe",
				illustration: "/illustrations/danger.svg",
			},
		],
		rejectLabel: "Geht nicht",
		acceptLabel: "Ist okay",
	},

	navigation: {
		next: "Weiter",
		skip: "Überspringen",
		back: "Zurück",
	},

	loading: {
		title: "Wir suchen die besten Ausbildungen für dich...",
	},

	results: {
		title: "Deine Ergebnisse",
		moreInfo: "Mehr erfahren",
		errorTitle: "Deine Ergebnisse konnten nicht geladen werden.",
		errorMessage:
			"Bitte überprüfe deine Internetverbindung und versuche es erneut.",
	},
};
