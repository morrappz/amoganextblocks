import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

import {
  TableDataProps,
  TableProps,
} from "@/components/chat/MenuItems/ShareMenu";

interface DOCXResult {
  buffer: Buffer;
  fileName: string;
  contentType: string;
}

export async function generateDocBuffer({
  data,
  table,
}: {
  data?: TableDataProps;
  table?: TableProps;
}): Promise<DOCXResult> {
  const headers = table?.headers || data?.tabs?.table?.headers;
  const rows = table?.rows || data?.tabs?.table?.rows;

  if (!headers || !Array.isArray(headers) || !Array.isArray(rows)) {
    throw new Error("Invalid data structure for DOC export");
  }

  const sanitizedRows = rows.map((row) =>
    headers.map((_, i) => row?.[i] ?? "")
  );

  const headerRow = new TableRow({
    children: headers.map(
      (header) =>
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: String(header), bold: true })],
            }),
          ],
        })
    ),
  });

  const dataRows = sanitizedRows.map(
    (row) =>
      new TableRow({
        children: row.map(
          (cell) =>
            new TableCell({
              children: [new Paragraph(String(cell))],
            })
        ),
      })
  );

  const tabledata = new Table({
    rows: [headerRow, ...dataRows],
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
  });

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: data?.title ?? "Data Export",
                bold: true,
                size: 28,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: data?.description ?? "", size: 24 }),
            ],
          }),
          new Paragraph({ text: "" }),
          tabledata,
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);

  return {
    buffer,
    fileName: `${data?.title ?? "data"}.docx`,
    contentType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };
}
