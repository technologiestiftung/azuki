import {
	cloneElement,
	isValidElement,
	type ReactElement,
	type ReactNode,
} from "react";

const labelClassName = "text-lg font-medium leading-[140%] text-gray-700";
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

	return (
		<div className={`flex flex-col gap-1.5 ${className}`}>
			<fieldset
				className="flex flex-col gap-1.5"
				aria-describedby={error && errorId ? errorId : undefined}
				aria-invalid={error ? true : undefined}
			>
				<legend className={`${labelClassName} mb-1.5 ${legendClassName}`}>
					{legend}
				</legend>
				{children}
			</fieldset>
			{error ? <FieldError id={errorId}>{error}</FieldError> : null}
		</div>
	);
}
