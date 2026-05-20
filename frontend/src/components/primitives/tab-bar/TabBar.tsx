import { Link } from "react-router-dom";

export interface TabBarProps {
	tabs: {
		label: string;
		href: string;
		ariaLabel: string;
		isDisabled?: boolean;
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
									? "relative z-10 border-gray-900 bg-sky-0 font-semibold text-gray-900"
									: "border-transparent text-gray-900"
							}`}
						>
							{tab.label}
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
