import { content } from "../../../content";
import { useToastStore } from "../../../store/useToastStore";

export function Toast() {
	const isOpen = useToastStore((state) => state.isOpen);
	const shakeKey = useToastStore((state) => state.shakeKey);
	const descriptionKey = useToastStore((state) => state.descriptionKey);
	const close = useToastStore((state) => state.close);

	if (!isOpen || !descriptionKey) {
		return null;
	}

	return (
		<div
			key={shakeKey}
			role="alert"
			className={`absolute bottom-[98px] inset-x-4 z-40 flex gap-0.5 justify-between items-center py-3 pl-4 pr-2 bg-sky-200 rounded-xl text-sky-900 ${shakeKey > 0 ? "animate-shake" : "animate-slideInBottom"}`}
		>
			<p className="text-base font-medium">{content[descriptionKey]}</p>
			<button
				type="button"
				className="w-10 h-10 flex items-center justify-center"
				onClick={close}
				aria-label={content["toast.close.ariaLabel"]}
			>
				<img src="/icons/close-black.svg" alt="" className="w-5 h-5" />
			</button>
		</div>
	);
}
