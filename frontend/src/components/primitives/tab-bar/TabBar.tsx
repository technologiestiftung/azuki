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
		<div className="flex px-4 w-full h-11 items-center">
			<div className="flex-1 flex gap-4">
				{tabs.map((tab) =>
					tab.isDisabled ? (
						<div
							key={tab.href}
							className="h-full text-lg text-gray-400 self-center"
						>
							{tab.label}
						</div>
					) : (
						<a
							key={tab.href}
							href={tab.href}
							aria-label={tab.ariaLabel}
							className={`h-full text-lg text-gray-900 self-center ${isActive(tab.href) ? "border-b-2 border-gray-900 font-semibold" : ""}`}
						>
							{tab.label}
						</a>
					),
				)}
			</div>
		</div>
	);
}
