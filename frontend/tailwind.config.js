/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		fontFamily: {
			asap: ["Asap", "system-ui", "sans-serif"],
		},
		extend: {
			fontSize: {
				xs: ["0.75rem", { lineHeight: "20px" }],
				sm: ["0.875rem", { lineHeight: "22px" }],
				base: ["1rem", { lineHeight: "22px" }],
				lg: ["1.125rem", { lineHeight: "28px" }],
				xl: ["1.25rem", { lineHeight: "28px" }],
				"2xl": ["1.5rem", { lineHeight: "32px" }],
				"3xl": ["1.875rem", { lineHeight: "36px" }],
				"4xl": ["2.25rem", { lineHeight: "48px" }],
				"5xl": ["3rem", { lineHeight: "48px" }],
				"6xl": ["3.75rem", { lineHeight: "60px" }],
				"7xl": ["4.5rem", { lineHeight: "72px" }],
				"8xl": ["6rem", { lineHeight: "96px" }],
				"9xl": ["8rem", { lineHeight: "128px" }],
			},
			colors: {
				white: "#ffffff",
				black: "#000000",
				gray: {
					0: "#fcfcfd",
					50: "#f9fafb",
					100: "#f3f4f6",
					200: "#e5e7eb",
					300: "#d1d5db",
					400: "#9ca3af",
					500: "#6b7280",
					600: "#4b5563",
					700: "#374151",
					800: "#1f2937",
					900: "#111827",
				},
				orange: {
					0: "#fffaf5",
					50: "#fff7ed",
					100: "#ffedd5",
					200: "#fed7aa",
					300: "#fdba74",
					400: "#fb9541",
					500: "#f97316",
					600: "#ea580c",
					700: "#c2410c",
					800: "#9a3412",
					900: "#7c2d12",
					950: "#260b03",
					1000: "#130602",
				},
				sky: {
					0: "#f0f9ff",
					50: "#ddf4ff",
					100: "#bae6fd",
					200: "#7dd3fc",
					300: "#38bdf8",
					400: "#009ee0",
					500: "#0284c7",
					600: "#006694",
					700: "#005074",
					800: "#003f5c",
					900: "#002842",
					1000: "#010c13",
					white: "#fafdff",
				},
				"card-fill": "#EEF2F6",
			},
			borderRadius: {
				"4xl": "32px",
			},
			keyframes: {
				fadeIn: {
					from: { opacity: "0" },
					to: { opacity: "1" },
				},
				slideInNext: {
					from: { transform: "translateX(100%)" },
					to: { transform: "translateX(0)" },
				},
				slideOutPrev: {
					from: { transform: "translateX(0)" },
					to: { transform: "translateX(-100%)" },
				},
				slideInPrev: {
					from: { transform: "translateX(-100%)" },
					to: { transform: "translateX(0)" },
				},
				slideOutNext: {
					from: { transform: "translateX(0)" },
					to: { transform: "translateX(100%)" },
				},
				slideOutLeft: {
					from: {
						opacity: "1",
						transform: "translateX(0) rotate(0deg) translateY(0)",
					},
					to: {
						opacity: "0",
						transform: "translateX(-100vw) rotate(-20deg) translateY(-40px)",
					},
				},
				slideOutRight: {
					from: {
						opacity: "1",
						transform: "translateX(0) rotate(0deg) translateY(0)",
					},
					to: {
						opacity: "0",
						transform: "translateX(100vw) rotate(20deg) translateY(-40px)",
					},
				},
				slideInLeft: {
					from: {
						opacity: "0",
						transform: "translateX(-100vw) rotate(-20deg) translateY(-40px)",
					},
					to: {
						opacity: "1",
						transform: "translateX(0) rotate(0deg) translateY(0)",
					},
				},
				slideInRight: {
					from: {
						opacity: "0",
						transform: "translateX(100vw) rotate(20deg) translateY(-40px)",
					},
					to: {
						opacity: "1",
						transform: "translateX(0) rotate(0deg) translateY(0)",
					},
				},
				progressFill: {
					from: { width: "0%" },
					to: { width: "100%" },
				},
			},
			animation: {
				fadeIn: "fadeIn 0.2s ease-in-out",
				slideInNext: "slideInNext 0.3s ease-in-out",
				slideOutPrev: "slideOutPrev 0.3s ease-in-out forwards",
				slideInPrev: "slideInPrev 0.3s ease-in-out",
				slideOutNext: "slideOutNext 0.3s ease-in-out forwards",
				slideOutLeft: "slideOutLeft 0.3s ease-in forwards",
				slideOutRight: "slideOutRight 0.3s ease-in forwards",
				slideInLeft: "slideInLeft 0.3s ease-out forwards",
				slideInRight: "slideInRight 0.3s ease-out forwards",
				progressFill: "progressFill 4s linear forwards",
			},
		},
	},
	plugins: [],
};
