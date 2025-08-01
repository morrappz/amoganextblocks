/* eslint-disable */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dateToIsoString, formatPrice } from "@/lib/utils";
import * as React from "react";
import { DateRange } from "react-day-picker";
import { getApiKey, getRevenueReportsData } from "../actions";
import { Button } from "@/components/ui/button";
import {
  Bar,
  BarChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ListTodo,
  MessageCircle,
  MessageSquareMore,
  Package,
  TicketPercent,
} from "lucide-react";
import { toast } from "sonner";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
// import { themes } from "@/registry/themes"

interface SalesTabClientProps {}

interface AI_KEY {
  apiKey: string;
  provider: string;
}

export default function SalesTabClient({}: SalesTabClientProps) {
  const [rapportData, setRapportData] = React.useState<{
    totals: { [x: string]: any };
    intervals: [];
  }>({
    totals: {},
    intervals: [],
  });
  const [chartData, setChartData] = React.useState<any>([]);
  const [filterDate, setFilterDate] = React.useState<DateRange | undefined>();
  const [loading, setLoading] = React.useState<boolean>(true);
  const [erorr, setError] = React.useState<string>("");
  const [apiKeys, setApiKeys] = React.useState<AI_KEY | null>(null);
  const chatId = uuidv4();
  // const theme = themes.find((theme) => theme.name === config.theme)

  React.useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const response = await getApiKey();
        setApiKeys(response[0]?.ai_provider_key);
      } catch (error) {
        toast.error("Error fetching AI API key");
        throw error;
      }
    };
    fetchApiKey();
  }, []);

  // const theme = themes.find((theme) => theme.name === config.theme)

  React.useEffect(() => {
    if (
      chartData?.length > 0 &&
      rapportData?.intervals?.length > 0 &&
      apiKeys
    ) {
      const saveSalesData = async () => {
        const response = await fetch("/api/store-sales-dashboard/sales-data", {
          method: "POST",
          body: JSON.stringify({ chartData, rapportData, apiKeys }),
        });
        if (!response.ok) {
          toast.error("Error saving data");
          return;
        }
      };
      saveSalesData();
    }
  }, [chartData]);

  const updateSalesData = (from?: Date, to?: Date) => {
    if (
      (filterDate?.from && !filterDate?.to) ||
      (!filterDate?.from && filterDate?.to)
    ) {
      toast.error("select range date", {
        description: "select range date",
      });
      return;
    }
    console.log("filterDate", filterDate);
    setLoading(true);
    getRevenueReportsData(
      dateToIsoString(filterDate?.from || from),
      dateToIsoString(filterDate?.to || to)
    )
      .then((res) => {
        console.log(res);
        setRapportData(res.success);

        const chartd = res.success?.intervals.map((interval: any) => {
          return {
            name: interval["interval"],
            ...interval["subtotals"],
          };
        });

        console.log("chartd", chartd);
        setChartData(chartd);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
      });
  };

  React.useEffect(() => {
    console.log("filterDate", filterDate);
  }, [filterDate]);

  React.useEffect(() => {
    const to_date = new Date();
    const from_date = new Date(to_date.getFullYear(), to_date.getMonth(), 1);

    setFilterDate({
      from: from_date,
      to: to_date,
    });
    updateSalesData(from_date, to_date);
  }, []);

  if (loading)
    return (
      <>
        {" "}
        <h1>loading ..</h1>
      </>
    );

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 justify-end">
        <DatePickerWithRange date={filterDate} setDate={setFilterDate} />
        <Button
          onClick={() => {
            updateSalesData();
          }}
        >
          Update
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-[1rem]">
              Gross sales
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-2xl font-bold">
              RM {formatPrice(rapportData.totals?.gross_sales || 0)}
            </div>
            <div className="flex text-xs text-muted-foreground justify-end space-x-2">
              <MessageSquareMore />
              <MessageCircle />
              <ListTodo />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-[1rem]">Refunds</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              RM {formatPrice(rapportData.totals?.refunds || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-[1rem]">Coupons</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              RM {formatPrice(rapportData.totals?.coupons || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-[1rem]">
              Net Revenue
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              RM {formatPrice(rapportData.totals?.net_revenue || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-[1rem]">Taxes</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              RM {formatPrice(rapportData.totals?.taxes || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-[1rem]">Shipping</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              RM {formatPrice(rapportData.totals?.shipping || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-[1rem]">
              Total Sales
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              RM {formatPrice(rapportData.totals?.total_sales || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-[1rem]">Products</CardTitle>
            <div className="flex text-xs text-muted-foreground">
              <Package className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rapportData.totals?.products || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-[1rem]">
              Coupons Count
            </CardTitle>
            <div className="flex text-xs text-muted-foreground">
              <TicketPercent className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rapportData.totals?.coupons_count || 0}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="flex h-[380px] max-[800px]:">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 10,
              left: 10,
              bottom: 0,
            }}
          >
            <XAxis dataKey="name" />
            {/* <YAxis /> */}
            <Tooltip
              wrapperStyle={
                {
                  color: "black",
                } as React.CSSProperties
              }
            />
            <Legend verticalAlign="top" height={36} />
            <Line
              type="monotone"
              strokeWidth={2}
              dataKey="net_revenue"
              stroke="#82ca9d"
              activeDot={{
                r: 6,
                style: { fill: "var(--theme-primary)", opacity: 0.25 },
              }}
            />
            <Line
              type="monotone"
              strokeWidth={2}
              dataKey="total_sales"
              stroke="#8884d8"
            />
            <Line
              type="monotone"
              strokeWidth={2}
              dataKey="gross_sales"
              stroke="#413ea0"
            />
            <Line
              type="monotone"
              strokeWidth={2}
              dataKey="taxes"
              stroke="red"
            />
            <Line
              type="monotone"
              strokeWidth={2}
              dataKey="shipping"
              stroke="#77c878"
            />
            <Line
              type="monotone"
              strokeWidth={2}
              dataKey="coupons"
              stroke="#ff7300"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {chartData?.length > 0 && (
        <Link href={`/store-sales-dashboard/chat/${chatId}`}>
          <Button className="sticky bottom-5 mt-5 w-full" variant={"outline"}>
            Chat with Board
          </Button>
        </Link>
      )}
    </div>
  );
}
