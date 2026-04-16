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
	"aria-label": ariaLabel,
	"aria-labelledby": ariaLabelledBy,
}) => {
	const dialogRef = useRef<HTMLDialogElement | null>(null);

	useEffect(() => {
		document.addEventListener("mousedown", handleClickListener);

		return () => {
			document.removeEventListener("mousedown", handleClickListener);
		};
	}, []);

	const handleClickListener = (event: MouseEvent) => {
		if (!dialogRef.current) {
			return;
		}

		/**
		 * This is confusing, yet correct. The dialog element spreads over the whole screen.
		 * If the user clicks on something inside the dialog, the event target won't be the dialog itself.
		 */
		const isClickOnDialogBackground = event.target === dialogRef.current;

		if (!isClickOnDialogBackground) {
			return;
		}

		closeDialog();
	};

	const closeDialog = () => {
		dialogRef.current?.close();
		afterClose?.();
	};

	return (
		<dialog
			ref={dialogRef}
			id={id}
			aria-label={ariaLabel}
			aria-labelledby={ariaLabelledBy}
			onClose={closeDialog}
			className={`${className} backdrop:bg-sky-1000/80 backdrop:backdrop-blur-[2px] bg-gray-100 opacity-100 z-40 rounded-4xl p-4`}
		>
			{children}
		</dialog>
	);
};
