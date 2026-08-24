import { content } from "../../content";
import { useLocation } from "react-router-dom";
import { ROUTE_PATHS } from "../../routing/routes";

const footerLinks = [
	{
		label: content["footer.about"],
		href: "/about",
		external: false,
	},
	// {
	// 	label: content["footer.feedback"],
	// 	href: content["footer.feedback.link"],
	// 	external: true,
	// },
	{
		label: content["footer.imprint"],
		href: content["footer.imprint.link"],
		external: true,
	},
	{
		label: content["footer.privacyPolicy"],
		href: content["footer.privacyPolicy.link"],
		external: true,
	},
] as const;

export function Footer() {
	const isOnAboutPage = useLocation().pathname === ROUTE_PATHS.about;

	return (
		<div className="bg-white">
			<div className="flex flex-col gap-4 pt-6 px-8 pb-8 rounded-t-4xl bg-sky-100">
				{footerLinks.map((link) => (
					<a
						key={link.label}
						href={link.href}
						target={link.external ? "_blank" : undefined}
						rel={link.external ? "noopener noreferrer" : undefined}
						className="flex gap-2 text-lg font-medium text-sky-900 disabled:text-gray-400 active:text-sky-800 disabled:text-sky-shade-70 hover:text-sky-800"
					>
						<span
							className={
								isOnAboutPage && link.label === content["footer.about"]
									? "font-bold"
									: "font-medium"
							}
						>
							{link.label}
						</span>
						{link.external && (
							<img
								src="/icons/open-in-new-dark.svg"
								alt=""
								width={20}
								height={20}
							/>
						)}
					</a>
				))}
			</div>
		</div>
	);
}
