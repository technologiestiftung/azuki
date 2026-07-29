import { jsPDF as JsPDFDocument } from "jspdf";

const PDF_MARGIN = 14;
const PDF_TITLE_COLOR: [number, number, number] = [0, 40, 66];
const PDF_HEAD_FILL: [number, number, number] = [0, 40, 66];
const PDF_FONT_SIZE = 9;
const PDF_LINE_HEIGHT_FACTOR = 1.2;
const PDF_CELL_PADDING_Y = 2;
const PT_TO_MM = 0.352778;

function getColumnWidths(
	tableWidth: number,
	columnCount: number,
	weights?: number[],
): number[] {
	const resolvedWeights =
		weights && weights.length === columnCount
			? weights
			: Array.from({ length: columnCount }, () => 1);
	const totalWeight = resolvedWeights.reduce((sum, weight) => sum + weight, 0);
	return resolvedWeights.map((weight) => (weight / totalWeight) * tableWidth);
}

function getLineHeightMm(doc: JsPDFDocument): number {
	return doc.getFontSize() * doc.getLineHeightFactor() * PT_TO_MM;
}

function wrapCellText(
	doc: JsPDFDocument,
	text: string,
	maxWidth: number,
): string[] {
	const lines = doc.splitTextToSize(text || "", maxWidth);
	return lines.length > 0 ? lines : [""];
}

function getWrappedTextHeight(doc: JsPDFDocument, lines: string[]): number {
	return lines.length * getLineHeightMm(doc);
}

function drawWrappedCellText(
	doc: JsPDFDocument,
	lines: string[],
	position: { x: number; rowTop: number },
): void {
	const lineHeight = getLineHeightMm(doc);
	let textY = position.rowTop + PDF_CELL_PADDING_Y + lineHeight * 0.85;

	for (const line of lines) {
		doc.text(line, position.x, textY);
		textY += lineHeight;
	}
}

export function exportPdfTable({
	filename,
	title,
	head,
	body,
	columnWeights,
}: {
	filename: string;
	title: string;
	head: string[];
	body: string[][];
	columnWeights?: number[];
}): void {
	const doc = new JsPDFDocument({
		orientation: "portrait",
		unit: "mm",
		format: "a4",
	});
	const pageWidth = doc.internal.pageSize.getWidth();
	const pageHeight = doc.internal.pageSize.getHeight();
	const tableWidth = pageWidth - PDF_MARGIN * 2;
	const columnWidths = getColumnWidths(tableWidth, head.length, columnWeights);

	doc.setFontSize(16);
	doc.setTextColor(...PDF_TITLE_COLOR);
	doc.text(title, PDF_MARGIN, 20);

	let y = 28;

	const drawHeaderRow = () => {
		doc.setFont("helvetica", "bold");
		doc.setFontSize(PDF_FONT_SIZE);
		doc.setLineHeightFactor(PDF_LINE_HEIGHT_FACTOR);

		const headerLines = head.map((label, index) =>
			wrapCellText(doc, label, columnWidths[index] - 2),
		);
		const headerContentHeight = Math.max(
			...headerLines.map((lines) => getWrappedTextHeight(doc, lines)),
		);
		const headerHeight = headerContentHeight + PDF_CELL_PADDING_Y * 2;

		doc.setFillColor(...PDF_HEAD_FILL);
		doc.rect(PDF_MARGIN, y, tableWidth, headerHeight, "F");
		doc.setTextColor(255, 255, 255);

		let x = PDF_MARGIN;
		for (const [index, lines] of headerLines.entries()) {
			drawWrappedCellText(doc, lines, { x: x + 1, rowTop: y });
			x += columnWidths[index];
		}

		y += headerHeight;
	};

	const ensureSpace = (rowHeight: number) => {
		if (y + rowHeight > pageHeight - PDF_MARGIN) {
			doc.addPage();
			y = PDF_MARGIN;
			drawHeaderRow();
		}
	};

	drawHeaderRow();

	doc.setFont("helvetica", "normal");
	doc.setTextColor(0, 0, 0);
	doc.setFontSize(PDF_FONT_SIZE);
	doc.setLineHeightFactor(PDF_LINE_HEIGHT_FACTOR);

	for (const row of body) {
		const cellLines = row.map((cell, index) =>
			wrapCellText(doc, cell, columnWidths[index] - 2),
		);
		const contentHeight = Math.max(
			...cellLines.map((lines) => getWrappedTextHeight(doc, lines)),
		);
		const rowHeight = contentHeight + PDF_CELL_PADDING_Y * 2;

		ensureSpace(rowHeight);

		let x = PDF_MARGIN;
		for (const [index, lines] of cellLines.entries()) {
			drawWrappedCellText(doc, lines, { x: x + 1, rowTop: y });
			x += columnWidths[index];
		}

		y += rowHeight;
	}

	doc.save(filename);
}
