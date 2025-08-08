"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Ellipsis,
  File,
  FileSpreadsheet,
  FileText,
  Folder,
  Share,
  Sheet,
} from "lucide-react";
import React from "react";
import { generatePDF } from "@/utils/generatePdf";
import { generateCsv } from "@/utils/generateCsv";
import { generateXlsx } from "@/utils/generateXlsx";
import { generateDoc } from "@/utils/generateDoc";

export interface TableDataProps {
  title: string;
  description: string;
  tabs: Tabs;
}

export interface Tabs {
  table: Table;
  chart: Chart;
}

export interface Table {
  headers: string[];
  rows: string[][];
}

export interface Chart {
  type: string;
  xAxis: string;
  yAxis: string;
  data: Daum[];
}

export interface Daum {
  label: string;
  value: number;
}

export interface TableProps {
  headers: string[];
  rows: string[][];
}

const ShareMenu = ({
  data,
  table,
}: {
  data: TableDataProps;
  table: TableProps;
}) => {
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Ellipsis className="w-5 h-5 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => generatePDF({ data, table })}>
              <FileText className="w-5 h-5 text-muted-foreground" /> PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => generateXlsx({ data, table })}>
              <FileSpreadsheet className="w-5 h-5 text-muted-foreground" />{" "}
              Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => generateCsv({ data, table })}>
              <Sheet className="w-5 h-5 text-muted-foreground" /> CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => generateDoc({ data, table })}>
              <File className="w-5 h-5 text-muted-foreground" />
              DOC
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Folder className="w-5 h-5 text-muted-foreground" />
              PPT
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Share className="w-5 h-5 text-muted-foreground" />
              Share
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ShareMenu;
