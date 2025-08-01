import React from "react";
import { FinalBomItem } from "../type";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { format } from "date-fns";
import { flexRender, Table } from "@tanstack/react-table";

interface RecordsCardProps {
  records: FinalBomItem[];
  table: Table<FinalBomItem>;
}

export function CardsView({ records, table }: RecordsCardProps) {

  const getActionCell = React.useCallback((recordId: string) => {
    return table
      .getRowModel()
      .rowsById[recordId]?.getAllCells()
      .find((cell) => cell.column.id === "actions");
  }, [table]);
  
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
  {records.map((record) => {
    const actionCell = getActionCell(record.final_bom_item_id?.toString() ?? "");
    return (
      <Card
        key={record?.final_bom_item_id}
        className="w-full rounded-md relative"
      >
        <CardHeader className="flex items-start space-x-4">
          <div>
            <CardTitle>
              {record?.bom_name}
            </CardTitle>
            <CardDescription>Status: {record?.status}</CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <p>ID: {record?.final_bom_item_id}</p>
          <p>
            Created:{" "}
            {record?.created_date &&
              format(record?.created_date, "PPP")}
          </p>
          <p>Type: {record?.type}</p>
          <p>Source: {record?.source}</p>
        </CardContent>

        <div className="absolute right-0 bottom-0 p-4">
          {actionCell
            ? flexRender(
                actionCell.column.columnDef.cell,
                actionCell.getContext()
              )
            : null}
        </div>
      </Card>
    );
  })}
</div>

  );
}
