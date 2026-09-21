interface EmptyStateProps {
	message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
	return (
		<div className="flex px-4 pb-4 items-center h-full">
			<div className="flex flex-col items-center justify-center gap-5 px-5">
				<div className="flex items-center justify-center object-contain p-2">
					<img
						src="/illustrations/no-results-star.svg"
						alt=""
						className="w-[200px]"
					/>
				</div>
				<p className="text-lg font-medium text-gray-1000 text-center">
					{message}
				</p>
			</div>
		</div>
	);
}
