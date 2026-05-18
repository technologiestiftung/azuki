import globals from "globals";
import technologiestiftung from "@technologiestiftung/eslint-config";

export default [
	...technologiestiftung,
	{
		files: ["**/*.{js,mjs,cjs,ts}"],
		languageOptions: {
			globals: { ...globals.node },
		},
	},
];
