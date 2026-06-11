import { Link } from "react-router-dom";

export interface TabBarProps {
	tabs: {
		label: string;
		href: string;
		ariaLabel: string;
		isDisabled?: boolean;
		vacanciesCount?: number;
	}[];
	activeTab: string;
}

export function TabBar({ tabs, activeTab }: TabBarProps) {
	const isActive = (tabHref: string) => tabHref === activeTab;
	return (
		<div className="relative flex w-full justify-center px-4">
			<div className="flex flex-1 gap-4">
				{tabs.map((tab) =>
					tab.isDisabled ? (
						<div
							key={tab.href}
							className="flex h-11 items-center text-lg text-gray-400"
						>
							{tab.label}
						</div>
					) : (
						<Link
							key={tab.href}
							to={tab.href}
							aria-label={tab.ariaLabel}
							aria-current={isActive(tab.href) ? "page" : undefined}
							className={`box-border flex h-11 items-center border-b-2 text-lg ${
								isActive(tab.href)
									? "relative z-10 border-gray-900 bg-sky-white font-semibold text-gray-900"
									: "border-transparent text-gray-900"
							}`}
						>
							{tab.label}
							{tab.vacanciesCount !== undefined && tab.vacanciesCount > 0 && (
								<span className="flex items-center justify-center w-[22px] h-[22px] ml-1 bg-sky-300 rounded-full text-gray-900 leading-[22px] text-sm font-normal">
									{tab.vacanciesCount}
								</span>
							)}
						</Link>
					),
				)}
			</div>
			<div
				className="pointer-events-none absolute inset-x-0 bottom-0 border-b-2 border-gray-200"
				aria-hidden
			/>
		</div>
	);
}
