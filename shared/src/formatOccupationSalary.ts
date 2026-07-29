export function formatOccupationSalary(amount: number): string {
	return `${amount.toLocaleString("de-DE", { maximumFractionDigits: 0 })} €`;
}
