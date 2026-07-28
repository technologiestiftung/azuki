import { content } from "../../content";
import { Link, useLocation } from "react-router-dom";
import { ROUTE_PATHS } from "../../routing/routes";
import { useMatchResultsStore } from "../../store/useMatchResultsStore";

export const BottomNav = () => {
	const { pathname } = useLocation();
	const vacanciesCount = useMatchResultsStore((state) => state.vacanciesCount);

	const navItems = [
		{
			href: "/profile",
			ariaLabel: content["bottomNav.profile.ariaLabel"],
			label: content["bottomNav.profile.label"],
			iconActive: "/icons/profile-blue.svg",
			iconInactive: "/icons/profile-gray.svg",
		},
		{
			href: ROUTE_PATHS.resultsList,
			ariaLabel: content["bottomNav.results.ariaLabel"],
			label: content["bottomNav.results.label"],
			iconActive: "/icons/briefcase-blue.svg",
			iconInactive: "/icons/briefcase-gray.svg",
		},
		{
			href: ROUTE_PATHS.resultsVacancies,
			ariaLabel: content["bottomNav.vacancies.ariaLabel"],
			label: content["bottomNav.vacancies.label"],
			iconActive: "/icons/list-blue.svg",
			iconInactive: "/icons/list-gray.svg",
			badge: vacanciesCount,
		},
	];

	return (
		<div className="max-w-[430px] mx-auto z-40 fixed bottom-0 left-0 right-0 py-[7px] px-2 bg-white border-t border-sky-shade-20">
			<nav className="flex justify-between items-center">
				<ul className="flex items-center w-full justify-between">
					{navItems.map((item) => (
						<li className="flex-1">
							<Link
								to={item.href}
								aria-label={item.ariaLabel}
								aria-current={pathname === item.href ? "page" : undefined}
								className="flex flex-col items-center justify-center gap-0.5 px-2 w-full"
							>
								<div className="relative">
									<img
										src={item.iconActive}
										alt=""
										aria-hidden
										className={pathname === item.href ? "block" : "hidden"}
									/>
									<img
										src={item.iconInactive}
										alt=""
										aria-hidden
										className={pathname === item.href ? "hidden" : "block"}
									/>

									{item.badge !== undefined && item.badge > 0 && (
										<span className="absolute -top-1 -right-2 flex items-center justify-center w-[18px] h-[18px] ml-[1px] mb-[1px] bg-sky-300 rounded-full text-[10px] text-center text-sky-900 leading-[14px] font-normal">
											{item.badge}
										</span>
									)}
								</div>

								<span
									className={`text-sm font-normal text-center ${pathname === item.href ? "text-sky-400" : "text-sky-shade-110"}`}
								>
									{item.label}
								</span>
							</Link>
						</li>
					))}
				</ul>
			</nav>
		</div>
	);
};
