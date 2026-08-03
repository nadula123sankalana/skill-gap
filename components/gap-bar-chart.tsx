"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { useReducedMotion } from "framer-motion";

export type ChartRow = {
  skill: string;
  score: number;
  benchmark: number;
  severity: "RED" | "YELLOW" | "GREEN";
};

const severityFill: Record<ChartRow["severity"], string> = {
  RED: "#E5484D",
  YELLOW: "#EA9A16",
  GREEN: "#17B981",
};

export function GapBarChart({ data }: { data: ChartRow[] }) {
  const reduced = useReducedMotion();

  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted">
        No scored skills to chart yet.
      </p>
    );
  }

  return (
    <div className="h-80 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 48 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E9F2" vertical={false} />
          <XAxis
            dataKey="skill"
            tick={{ fontSize: 11, fill: "#5B6580" }}
            interval={0}
            angle={-25}
            textAnchor="end"
            height={60}
            axisLine={{ stroke: "#E5E9F2" }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: "#5B6580" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(59, 130, 246, 0.06)" }}
            contentStyle={{
              borderRadius: 14,
              border: "1px solid #E5E9F2",
              boxShadow: "0 12px 32px rgba(11, 18, 32, 0.12)",
              fontSize: 12,
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            iconType="circle"
          />
          <Bar
            dataKey="score"
            name="Your score"
            radius={[6, 6, 0, 0]}
            isAnimationActive={!reduced}
            animationDuration={900}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={severityFill[entry.severity]} />
            ))}
          </Bar>
          <Bar
            dataKey="benchmark"
            name="Benchmark"
            fill="#3B82F6"
            fillOpacity={0.28}
            radius={[6, 6, 0, 0]}
            isAnimationActive={!reduced}
            animationDuration={900}
            animationBegin={150}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
