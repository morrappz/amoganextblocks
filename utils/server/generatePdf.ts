// Install: npm install jspdf jspdf-autotable

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export async function generatePDFBuffer({
  data,
  table,
}: {
  data: any;
  table: any;
}): Promise<{ buffer: Buffer; fileName: string; contentType: string }> {
  const title = data?.title || "Untitled";
  const description = data?.description || "";
  const headers = table?.headers || data?.tabs?.table?.headers || [];
  const rows = table?.rows || data?.tabs?.table?.rows || [];

  if (!Array.isArray(headers) || !Array.isArray(rows)) {
    throw new Error("Invalid table data");
  }

  const sanitizedRows = rows
    .filter((row: any) => Array.isArray(row) && row.length === headers.length)
    .map((row) => row.map((cell) => String(cell || "")));

  const doc = new jsPDF();

  // Add title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(title, 20, 20);

  let yPosition = 30;

  // Add description if provided
  if (description) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const splitDescription = doc.splitTextToSize(description, 170);
    doc.text(splitDescription, 20, yPosition);
    yPosition += splitDescription.length * 5 + 10;
  }

  // Add table
  autoTable(doc, {
    head: [headers.map((header) => String(header || ""))],
    body: sanitizedRows,
    startY: yPosition,
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [245, 245, 245],
      textColor: [0, 0, 0],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [249, 249, 249],
    },
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
  });

  // Convert to buffer
  const pdfArrayBuffer = doc.output("arraybuffer");
  const buffer = Buffer.from(pdfArrayBuffer);

  return {
    buffer,
    fileName: `${title.replace(/[^a-z0-9]/gi, "_")}.pdf`,
    contentType: "application/pdf",
  };
}
