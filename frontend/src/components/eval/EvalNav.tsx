import { Link, useLocation } from "react-router-dom";
import { ROUTE_PATHS } from "../../routing/routes";

export function EvalNav() {
	const { pathname } = useLocation();
	const isEval = pathname.startsWith("/eval");
	const isPersonas = pathname.startsWith("/personas");
	return (
		<nav className="flex gap-4 text-sm mb-4">
			<Link
				to={ROUTE_PATHS.eval}
				className={
					isEval
						? "font-semibold underline"
						: "text-sky-shade-160 hover:text-sky-900"
				}
			>
				Eval
			</Link>
			<Link
				to={ROUTE_PATHS.personas}
				className={
					isPersonas
						? "font-semibold underline"
						: "text-sky-shade-160 hover:text-sky-900"
				}
			>
				Personas
			</Link>
		</nav>
	);
}
