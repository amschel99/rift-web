import * as React from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { colors } from "@/constants";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTokenHistoricalData } from "@/hooks/token/useTokenHistoricalData";
import { CandlestickData } from "lightweight-charts";

const chartConfig = {
  close: {
    label: "Close Price",
    color: colors.accent,
  },
} as const;

type ChartKey = keyof typeof chartConfig;

const daysRangeMapping = {
  "1D": 1,
  "1W": 7,
  "1M": 30,
  "1Y": 365,
  YTD: 365,
  ALL: 10000,
};

export function PriceChart({ tokenID }: { tokenID: string }) {
  const activeChart: ChartKey = "close";
  const [activeRange, setActiveRange] = useState<
    "1D" | "1W" | "1M" | "1Y" | "YTD" | "ALL"
  >("1M");
  const { historicalData, isLoadingHistoricalData, errorHistoricalData } =
    useTokenHistoricalData(tokenID, daysRangeMapping[activeRange]);

  function filterChartData(data: CandlestickData[], range: typeof activeRange) {
    const now = new Date(data[data.length - 1].time as number);
    switch (range) {
      case "1D":
        return [data[data.length - 1]];
      case "1W":
        return data.slice(-7);
      case "1M":
        return data.slice(-30);
      case "1Y":
        return data.filter(
          (d) => new Date(d.time as number).getFullYear() === now.getFullYear()
        );
      case "YTD":
        return data.filter(
          (d) => new Date(d.time as number).getFullYear() === now.getFullYear()
        );
      case "ALL":
      default:
        return data;
    }
  }

  if (isLoadingHistoricalData) {
    return (
      <div className="flex justify-center items-center bg-accent p-4 mx-2 animate-pulse h-[350px] mb-4 rounded-xl"></div>
    );
  }
  if (errorHistoricalData) {
    return (
      <div className="flex bg-accent rounded-xl p-4 mx-2">
        <p className="text-danger text-sm">Error loading data</p>
        <p className="text-danger text-sm">{errorHistoricalData?.toString()}</p>
      </div>
    );
  }

  if (!historicalData) {
    return (
      <div className="flex justify-center items-center bg-accent p-4 mx-2 h-[350px] mb-4 rounded-xl">
        <p className="text-sm">No data available</p>
      </div>
    );
  }

  return (
    <Card className="shadow-none border-none bg-transparent">
      <CardContent className="sm:p-2">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[300px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={filterChartData(historicalData, activeRange)}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="time"
              tickLine={false}
              hide
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg border border-text-subtle bg-app-background p-2 shadow-sm">
                      <div className="text-xs font-medium">
                        {new Date(data.time as number).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <div className="w-3 h-3 rounded-xs bg-accent-secondary" />
                        Close: ${data.close.toLocaleString()}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              dataKey={activeChart}
              type="monotone"
              stroke={chartConfig[activeChart].color}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex items-center justify-between w-full">
          <Button
            variant="ghost"
            onClick={() => setActiveRange("1D")}
            className={cn(activeRange === "1D" && "bg-accent")}
          >
            1D
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveRange("1W")}
            className={cn(activeRange === "1W" && "bg-accent")}
          >
            1W
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveRange("1M")}
            className={cn(activeRange === "1M" && "bg-accent")}
          >
            1M
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveRange("1Y")}
            className={cn(activeRange === "1Y" && "bg-accent")}
          >
            1Y
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveRange("YTD")}
            className={cn(activeRange === "YTD" && "bg-accent")}
          >
            YTD
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
