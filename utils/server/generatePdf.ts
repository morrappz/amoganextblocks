import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export async function generatePDFBuffer({
  table,
  chart,
  story,
}: {
  table: any;
  chart: any;
  story: any;
}): Promise<{ buffer: Buffer; fileName: string; contentType: string }> {
  const title = table?.title || "Untitled";
  const description = table?.description || "";
  const headers = table?.data?.headers || [];
  const rows = table?.data?.rows || [];

  const sanitizedRows = rows.map((row: any) =>
    row.map((cell: any) => String(cell || ""))
  );

  const doc = new jsPDF();

  // Title
  doc.setFontSize(20).setFont("helvetica", "bold").text(title, 20, 20);

  let y = 30;

  // Description
  if (description) {
    doc.setFontSize(12).setFont("helvetica", "normal");
    const splitDescription = doc.splitTextToSize(description, 170);
    doc.text(splitDescription, 20, y);
    y += splitDescription.length * 5 + 10;
  }

  // Table
  autoTable(doc, {
    head: [headers],
    body: sanitizedRows,
    startY: y,
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [230, 230, 230] },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // Chart data (just list values in PDF)
  if (chart) {
    doc
      .setFontSize(14)
      .setFont("helvetica", "bold")
      .text(chart.title || "Chart", 20, y);
    y += 8;
    doc
      .setFontSize(10)
      .setFont("helvetica", "normal")
      .text(chart.description || "", 20, y);
    y += 6;

    chart.chartData?.data?.forEach((point: any) => {
      doc.text(`${point.label}: ${point.value}`, 20, y);
      y += 5;
    });
  }

  y += 10;

  // Story section
  if (story) {
    doc
      .setFontSize(14)
      .setFont("helvetica", "bold")
      .text(story.title || "Story", 20, y);
    y += 8;
    doc
      .setFontSize(10)
      .setFont("helvetica", "normal")
      .text(story.description || "", 20, y);
    y += 6;
    story.data?.forEach((line: string) => {
      const splitLine = doc.splitTextToSize(line, 170);
      doc.text(splitLine, 20, y);
      y += splitLine.length * 5;
    });
  }

  const buffer = Buffer.from(doc.output("arraybuffer"));
  return {
    buffer,
    fileName: `${title.replace(/[^a-z0-9]/gi, "_")}.pdf`,
    contentType: "application/pdf",
  };
}
