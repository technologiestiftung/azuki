import { serve } from "@hono/node-server";
import app from "./app.js";

const port = Number.parseInt(process.env.PORT ?? "3001", 10);

serve({ fetch: app.fetch, port }, (info) => {
	// eslint-disable-next-line no-console -- startup banner for the dev server entrypoint
	console.log(`Backend running on http://localhost:${info.port}`);
});
