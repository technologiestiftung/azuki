/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		fontFamily: {
			asap: ["Asap", "system-ui", "sans-serif"],
		},
		extend: {
			fontSize: {
				xs: ["0.75rem", { lineHeight: "1rem" }],
				sm: ["0.875rem", { lineHeight: "1.25rem" }],
				base: ["1rem", { lineHeight: "1.5rem" }],
				lg: ["1.125rem", { lineHeight: "1.75rem" }],
				xl: ["1.25rem", { lineHeight: "1.75rem" }],
				"2xl": ["1.5rem", { lineHeight: "2rem" }],
				"3xl": ["1.875rem", { lineHeight: "2.25rem" }],
				"4xl": ["2.25rem", { lineHeight: "2.5rem" }],
				"5xl": ["3rem", { lineHeight: "3rem" }],
				"6xl": ["3.75rem", { lineHeight: "3.75rem" }],
				"7xl": ["4.5rem", { lineHeight: "4.5rem" }],
				"8xl": ["6rem", { lineHeight: "6rem" }],
				"9xl": ["8rem", { lineHeight: "8rem" }],
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
					10: "#F2F4F5",
					20: "#E4E8EB",
					50: "#ddf4ff",
					100: "#bae6fd",
					110: "#6B8392",
					140: "#436174",
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
				"sky-shade": {
					20: "#E4E8EB",
					110: "#6B8392",
				},
				"card-fill": "#EEF2F6",
				"fill-secondary": "#1325491C",
				"fill-primary": "#020919F0",
				red: {
					700: "#B91C1C",
				},
			},
			borderRadius: {
				"4xl": "32px",
			},
			keyframes: {
				fadeIn: {
					from: { opacity: "0" },
					to: { opacity: "1" },
				},
				fadeInUp: {
					from: { opacity: "0", transform: "translateY(0.5rem)" },
					to: { opacity: "1", transform: "translateY(0)" },
				},
				slideInUp: {
					from: { transform: "translateY(1rem)" },
					to: { transform: "translateY(0)" },
				},
				slideInDown: {
					from: { transform: "translateY(-1rem)" },
					to: { transform: "translateY(0)" },
				},
				fadeOut: {
					from: { opacity: "1" },
					to: { opacity: "0" },
				},
				slideInBottom: {
					from: { transform: "translateY(100%)" },
					to: { transform: "translateY(0)" },
				},
				illustrationEnter: {
					from: { opacity: "0", transform: "translateY(100%)" },
					to: { opacity: "1", transform: "translateY(0)" },
				},
				slideOutBottom: {
					from: { transform: "translateY(var(--sheet-drag-y, 0px))" },
					to: { transform: "translateY(100%)" },
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
				/** No-gos back: hold full tint ~45%, then fade (sync duration with SLIDE_IN_MS). */
				slideInLeftTint: {
					"0%, 45%": { opacity: "1" },
					"100%": { opacity: "0" },
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
				slideInRightTint: {
					"0%, 45%": { opacity: "1" },
					"100%": { opacity: "0" },
				},
				/** Back card (former top) shrinks into stack when navigating back; matches mixBackCardSurfaceColor ends. */
				backCardSlideInRecede: {
					from: {
						transform: "scale(1) translateY(0px)",
						backgroundColor: "rgb(229 231 235)",
					},
					to: {
						transform: "scale(var(--stack-ghost-scale, 0.85)) translateY(41px)",
						backgroundColor: "rgb(209 213 219)",
					},
				},
				/** Strengths slider exits before the custom-strength card appears. */
				strengthsSliderSlideOut: {
					from: {
						opacity: "1",
						transform: "translateY(0)",
					},
					to: {
						opacity: "0",
						transform: "translateY(100%)",
					},
				},
				/** Custom strength screen grows from stack ghost size to full card height. */
				customStrengthCardExpand: {
					from: {
						transform: "scale(var(--stack-ghost-scale, 0.84)) translateY(41px)",
					},
					to: {
						transform: "scale(1) translateY(0)",
					},
				},
				slideInTop: {
					from: {
						opacity: "0",
						transform: "translateY(-100vh) scale(0.3)",
					},
					to: {
						opacity: "1",
						transform: "translateY(0) scale(1)",
					},
				},
				progressFill: {
					from: { width: "0%" },
					to: { width: "100%" },
				},
				shake: {
					"0%, 100%": { transform: "translateX(0)" },
					"25%": { transform: "translateX(-5px)" },
					"50%": { transform: "translateX(5px)" },
					"75%": { transform: "translateX(-5px)" },
				},
			},
			animation: {
				fadeIn: "fadeIn 0.2s ease-in-out",
				fadeInUp: "fadeInUp 0.2s ease-in-out",
				slideInUp: "slideInUp 0.2s ease-in-out",
				slideInDown: "slideInDown 0.2s ease-in-out",
				fadeOut: "fadeOut 0.2s ease-in-out forwards",
				slideInBottom:
					"slideInBottom 0.32s cubic-bezier(0.32, 0.72, 0, 1) forwards",
				illustrationEnter:
					"illustrationEnter 0.7s cubic-bezier(0.32, 0.72, 0, 1) forwards",
				slideOutBottom:
					"slideOutBottom 0.28s cubic-bezier(0.4, 0, 1, 1) forwards",
				slideInNext: "slideInNext 0.3s ease-in-out",
				slideOutPrev: "slideOutPrev 0.3s ease-in-out forwards",
				slideInPrev: "slideInPrev 0.3s ease-in-out",
				slideOutNext: "slideOutNext 0.3s ease-in-out forwards",
				slideInLeft: "slideInLeft 0.3s ease-out forwards",
				slideInRight: "slideInRight 0.3s ease-out forwards",
				slideInLeftTint:
					"slideInLeftTint 800ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
				slideInRightTint:
					"slideInRightTint 800ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
				backCardSlideInRecede:
					"backCardSlideInRecede 800ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
				strengthsSliderSlideOut:
					"strengthsSliderSlideOut 400ms cubic-bezier(0.4, 0, 1, 1) forwards",
				customStrengthCardExpand:
					"customStrengthCardExpand 800ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
				slideInTop: "slideInTop 0.4s ease-out forwards",
				progressFill: "progressFill 4s linear forwards",
				shake: "shake 0.4s ease-in-out forwards",
			},
		},
	},
	plugins: [],
};
