import * as XLSX from "xlsx";

interface XlsxOptions {
  data?: {
    title?: string;
    tabs?: {
      table?: {
        headers: string[];
        rows: string[][];
      };
    };
  };
  table?: {
    headers: string[];
    rows: string[][];
  };
}

export function generateXlsxBuffer({ data, table }: XlsxOptions): {
  buffer: Buffer;
  fileName: string;
  contentType: string;
} {
  const headers = table?.headers || data?.tabs?.table?.headers;
  const rows = table?.rows || data?.tabs?.table?.rows;

  if (!headers || !Array.isArray(headers) || !Array.isArray(rows)) {
    throw new Error("Invalid data format");
  }

  const sanitizedRows = rows.map((row) =>
    headers.map((_, i) => row?.[i] ?? "")
  );

  const worksheetData = [headers, ...sanitizedRows];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  const buffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "buffer",
  });

  return {
    buffer,
    fileName: `${data?.title || "Data"}.xlsx`,
    contentType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
}
