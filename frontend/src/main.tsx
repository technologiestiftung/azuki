import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { AppProvider } from "./context/AppContext.tsx";
import "./index.css";

function render() {
	const root = document.getElementById("root");

	if (!root) {
		return;
	}

	createRoot(root).render(
		<StrictMode>
			<AppProvider>
				<App />
			</AppProvider>
		</StrictMode>,
	);
}

render();
