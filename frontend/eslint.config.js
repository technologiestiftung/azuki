import globals from "globals";
import technologiestiftung from "@technologiestiftung/eslint-config";
import react from "eslint-plugin-react";

const SERVER_DATA_MESSAGE =
	"BIBB DAZUBI-derived data must not reach the frontend bundle (CC BY-NC-ND). Fetch it from the admin API.";

export default [
	...technologiestiftung,
	{
		files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
		plugins: {
			react,
		},
		languageOptions: {
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
		rules: {
			// suppress errors for missing 'import React' in files
			"react/react-in-jsx-scope": "off",
			// self close react components when possible
			"react/self-closing-comp": "error",
			"no-restricted-imports": [
				"error",
				{
					paths: [
						{
							name: "@azuki/shared/server-data",
							message: SERVER_DATA_MESSAGE,
						},
					],
					patterns: [
						{
							group: [
								"**/shared/data/popularity-index.json",
								"**/shared/data/availability-by-state.json",
							],
							message: SERVER_DATA_MESSAGE,
						},
					],
				},
			],
		},
	},
];
