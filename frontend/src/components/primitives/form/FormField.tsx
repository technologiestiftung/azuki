import {
	cloneElement,
	isValidElement,
	useEffect,
	useRef,
	type ReactElement,
	type ReactNode,
} from "react";

const labelClassName = "text-lg font-medium leading-[140%] text-sky-shade-170";
const errorClassName = "text-sm font-normal leading-[140%] text-red-600";

export type FieldErrorProps = {
	children: ReactNode;
	className?: string;
	id?: string;
};

export function FieldError({ children, className = "", id }: FieldErrorProps) {
	return (
		<p id={id} role="alert" className={`${errorClassName} ${className}`}>
			{children}
		</p>
	);
}

type ControlAriaProps = {
	"aria-describedby"?: string;
};

export type FormFieldProps = {
	label: string;
	htmlFor: string;
	error?: string;
	children: ReactNode;
	className?: string;
};

export function FormField({
	label,
	htmlFor,
	error,
	children,
	className = "",
}: FormFieldProps) {
	const errorId = `${htmlFor}-error`;
	const control = isValidElement(children)
		? cloneElement(children as ReactElement<ControlAriaProps>, {
				"aria-describedby": error ? errorId : undefined,
			})
		: children;

	return (
		<div className={`flex flex-col gap-1.5 ${className}`}>
			<label htmlFor={htmlFor} className={labelClassName}>
				{label}
			</label>
			{control}
			{error ? <FieldError id={errorId}>{error}</FieldError> : null}
		</div>
	);
}

export type FormFieldsetProps = {
	legend: string;
	error?: string;
	children: ReactNode;
	className?: string;
	legendClassName?: string;
	/** Used to build a stable `${id}-error` id for aria-describedby. */
	id?: string;
};

export function FormFieldset({
	legend,
	error,
	children,
	className = "",
	legendClassName = "",
	id,
}: FormFieldsetProps) {
	const errorId = id ? `${id}-error` : undefined;
	const fieldsetRef = useRef<HTMLFieldSetElement>(null);

	useEffect(() => {
		// Safari can cache a stale (too-tall) intrinsic height for a <fieldset>
		// rendered while an ancestor (e.g. a bottom sheet) is still animating in.
		// Mutating its child list once forces WebKit to recompute the real height.
		const fieldset = fieldsetRef.current;
		if (!fieldset) {
			return;
		}
		const probe = document.createElement("span");
		fieldset.appendChild(probe);
		void fieldset.offsetHeight;
		probe.remove();
	}, []);

	return (
		<div className={`flex flex-col gap-1.5 ${className}`}>
			<fieldset
				ref={fieldsetRef}
				aria-describedby={error && errorId ? errorId : undefined}
				aria-invalid={error ? true : undefined}
			>
				<legend className={`${labelClassName} mb-1.5 ${legendClassName}`}>
					{legend}
				</legend>
				<div className="flex flex-col gap-1.5">{children}</div>
			</fieldset>
			{error ? <FieldError id={errorId}>{error}</FieldError> : null}
		</div>
	);
}
