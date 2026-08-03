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

export type ChartRow = {
  skill: string;
  score: number;
  benchmark: number;
  severity: "RED" | "YELLOW" | "GREEN";
};

const severityFill: Record<ChartRow["severity"], string> = {
  RED: "#C44536",
  YELLOW: "#C49A1A",
  GREEN: "#2A7A55",
};

export function GapBarChart({ data }: { data: ChartRow[] }) {
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
          <CartesianGrid strokeDasharray="3 3" stroke="#D5DEE1" />
          <XAxis
            dataKey="skill"
            tick={{ fontSize: 11, fill: "#5A6B70" }}
            interval={0}
            angle={-25}
            textAnchor="end"
            height={60}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: "#5A6B70" }}
            className="font-mono"
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              borderColor: "#D5DEE1",
              fontSize: 12,
            }}
          />
          <Legend />
          <Bar dataKey="score" name="Your score" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={severityFill[entry.severity]} />
            ))}
          </Bar>
          <Bar
            dataKey="benchmark"
            name="Benchmark"
            fill="#0E5F6B"
            fillOpacity={0.35}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
