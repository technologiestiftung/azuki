import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const repoRoot = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"..",
);

export default defineConfig({
	envDir: repoRoot,
	plugins: [react()],
	define: {
		global: "globalThis",
	},
	resolve: {
		alias: {
			buffer: "buffer/",
		},
	},
	optimizeDeps: {
		include: ["@lottiefiles/dotlottie-react", "buffer"],
	},
	server: {
		proxy: {
			"/api": {
				target: "http://localhost:3001",
				changeOrigin: true,
			},
			"^/results/\\d+$": {
				target: "http://localhost:3001",
				changeOrigin: true,
			},
		},
	},
});
