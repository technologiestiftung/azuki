interface BadgeProps {
	label: string;
}

export function Badge({ label }: BadgeProps) {
	return (
		<div className="bg-fill-secondary text-gray-900 text-xs leading-5 font-medium p-2 rounded-lg">
			{label}
		</div>
	);
}
