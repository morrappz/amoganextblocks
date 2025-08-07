import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

import { Card, CardContent, CardTitle } from "../ui/card";
import { Table, TableHead, TableRow, TableBody } from "../ui/table";
import { ChartRenderer } from "./ChartRenderer";

type RawChartData = {
  type: string;
  xAxis: string;
  yAxis: string;
  data: { label: string; value: number }[];
};

type ChartRendererData = {
  type: string;
  title: string;
  labels: string[];
  data: number[];
};

export function transformToChartRendererFormat(
  rawChart: RawChartData
): ChartRendererData {
  return {
    type: rawChart.type,
    title: `${rawChart.yAxis} by ${rawChart.xAxis}`,
    labels: rawChart.data.map((d) => d.label),
    data: rawChart.data.map((d) => d.value),
  };
}

const AnalyticCard = ({ analyticCard }: { analyticCard: any }) => {
  return (
    <div>
      <Card className="p-2.5">
        <CardTitle>{analyticCard?.title}</CardTitle>
        <span>{analyticCard?.description}</span>
        <CardContent className="py-3">
          <div className=" w-full ">
            <Tabs defaultValue="table" className="w-full">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="table">Table</TabsTrigger>
                <TabsTrigger value="chart">Chart</TabsTrigger>
              </TabsList>
              <TabsContent value="table">
                <div className="">
                  <Table>
                    <TableHead>
                      <TableRow>
                        {analyticCard?.tabs?.table.headers?.map((header, i) => (
                          <TableHead key={i}>{header}</TableHead>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analyticCard?.tabs?.table?.rows?.map((row, index) => (
                        <TableRow key={index}>
                          {row.map((cell, colIndex) => (
                            <td key={colIndex}>{cell}</td>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              <TabsContent value="chart">
                <ChartRenderer
                  chartData={transformToChartRendererFormat(
                    analyticCard?.tabs?.chart
                  )}
                />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticCard;
