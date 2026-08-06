import React, { useEffect, useRef } from "react";

interface DefaultDialogProps {
	children?: React.ReactNode;
	className?: string;
	id?: string;
	afterClose?: () => void;
	isOpen?: boolean;
	"aria-label"?: string;
	"aria-labelledby"?: string;
}

export const DefaultDialog: React.FC<DefaultDialogProps> = ({
	children,
	className,
	id,
	afterClose,
	isOpen = false,
	"aria-label": ariaLabel,
	"aria-labelledby": ariaLabelledBy,
}) => {
	const dialogRef = useRef<HTMLDialogElement | null>(null);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) {
			return;
		}

		if (isOpen && !dialog.open) {
			dialog.showModal();
		} else if (!isOpen && dialog.open) {
			dialog.close();
		}
	}, [isOpen]);

	useEffect(() => {
		const handleClickListener = (event: MouseEvent) => {
			const dialog = dialogRef.current;
			if (!dialog) {
				return;
			}

			/**
			 * If the user clicks on something inside the dialog, the event target won't be the dialog itself.
			 */
			if (event.target === dialog) {
				dialog.close();
			}
		};

		document.addEventListener("mousedown", handleClickListener);
		return () => {
			document.removeEventListener("mousedown", handleClickListener);
		};
	}, []);

	return (
		<dialog
			ref={dialogRef}
			id={id}
			aria-label={ariaLabel}
			aria-labelledby={ariaLabelledBy}
			onClose={afterClose}
			className={`${className ?? ""} backdrop:bg-sky-1000/80 backdrop:backdrop-blur-[2px] bg-gray-100 opacity-100 z-40 rounded-4xl p-4`}
		>
			{children}
		</dialog>
	);
};
