"use client";

import { CartesianGrid, LabelList, Line, LineChart, XAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader } from "../ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
const chartData = [
  { day: "Mon", locked: 186, unlocked: 80 },
  { day: "Tue", locked: 305, unlocked: 200 },
  { day: "Wed", locked: 237, unlocked: 120 },
  { day: "Thur", locked: 73, unlocked: 190 },
  { day: "Fri", locked: 209, unlocked: 130 },
  { day: "Sat", locked: 214, unlocked: 140 },
];

const chartConfig = {
  desktop: {
    label: "Locked Tokens",
    color: "#fe4a22",
  },
  mobile: {
    label: "Unlocked Tokens",
    color: "#2656ed",
  },
} satisfies ChartConfig;

export function UnlockedChart() {
  return (
    <Card className="border-none">
      <CardHeader className="">
        <CardDescription className="font-body -mb-2">
          USDT unlocked This Week
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[150px] w-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 20,
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
              style={{
                color: "#fff",
                fill: "#fff",
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent indicator="dot" className="bg-divider" />
              }
            />
            <Line
              dataKey="unlocked"
              type="natural"
              stroke="#fe4a22"
              strokeWidth={2}
              dot={{
                fill: "#2656ed",
              }}
              activeDot={{
                r: 6,
              }}
            >
              <LabelList
                position="top"
                offset={10}
                className="fill-foreground text-xs font-semibold"
                fontSize={12}
              />
            </Line>
          </LineChart>
        </ChartContainer>
      </CardContent>
      {/* <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter> */}
    </Card>
  );
}
