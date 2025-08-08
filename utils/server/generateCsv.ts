// utils/server/generateCsv.ts
import Papa from "papaparse";

interface CsvOptions {
  headers: string[];
  rows: string[][];
  title?: string;
}

export function generateCsvBuffer({ headers, rows }: CsvOptions): Buffer {
  const sanitizedRows = rows.map((row) =>
    headers.map((_, i) => row?.[i] ?? "")
  );

  const csv = Papa.unparse({
    fields: headers,
    data: sanitizedRows,
  });

  return Buffer.from(csv, "utf-8");
}
