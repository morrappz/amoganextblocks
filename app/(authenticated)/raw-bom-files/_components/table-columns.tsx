"use client";

import { type MyDoc, MyDocStatus, myDocStatuses } from "../type";
import type { DataTableRowAction } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";
import { Ellipsis } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/utils";

import { updateRecord } from "../_lib/actions";
import { getStatusIcon } from "../_lib/utils";

interface GetColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<MyDoc> | null>
  >;
}

export function getColumns({
  setRowAction,
}: GetColumnsProps): ColumnDef<MyDoc>[] {
  return [
    {
      id: "select",
      maxSize: 28,
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-0.5"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-0.5"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = myDocStatuses.find(
          (status) => status === row.original.status
        );

        if (!status) return null;

        const Icon = getStatusIcon(status);

        return (
          <div className="flex w-[6.25rem] items-center">
            <Icon
              className="mr-2 size-4 text-muted-foreground"
              aria-hidden="true"
            />
            <span className="capitalize">{status}</span>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return Array.isArray(value) && value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "created_date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ cell }) => formatDate(cell.getValue() as Date),
    },
    {
      accessorKey: "doc_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("doc_name")}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      maxSize: 28,
      cell: function Cell({ row }) {
        const [isUpdatePending, startUpdateTransition] = React.useTransition();

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Open menu"
                variant="ghost"
                className="flex size-8 p-0 data-[state=open]:bg-muted"
              >
                <Ellipsis className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onSelect={() => setRowAction({ row, type: "update" })}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={row.original.doc_name || ""}
                    onValueChange={(value) => {
                      startUpdateTransition(() => {
                        toast.promise(
                          updateRecord({
                            id: row.original.mydoc_id,
                            status: value as MyDocStatus,
                            doc_name: row.original.doc_name || "",
                          }).then((data) => {
                            if (data.error) throw data.error;
                            return { ...data };
                          }),
                          {
                            loading: "Updating...",
                            success: "Status updated",
                            error: (err) => err,
                          }
                        );
                      });
                    }}
                  >
                    {myDocStatuses.map((status) => (
                      <DropdownMenuRadioItem
                        key={status}
                        value={status}
                        className="capitalize"
                        disabled={isUpdatePending}
                      >
                        {status}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => setRowAction({ row, type: "delete" })}
              >
                Delete
                <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      size: 40,
    },
  ];
}
