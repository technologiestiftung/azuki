interface BadgeProps {
	label: string;
}

export function Badge({ label }: BadgeProps) {
	return (
		<div className="inline-flex h-[22px] max-w-full shrink-0 items-center justify-center whitespace-nowrap rounded-lg bg-fill-secondary p-2 text-sm font-medium leading-5 text-sky-900">
			{label}
		</div>
	);
}
