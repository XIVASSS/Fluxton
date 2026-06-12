"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { UsageDay } from "@/lib/selectors";
import { formatKwh } from "@/lib/format";
import { AnimatedCard } from "../motion/AnimatedCard";

interface TaskTimeChartProps {
  series: UsageDay[];
  onClick?: () => void;
}

/** Mytasky-style weekday energy bars with salmon peak highlight. */
export function TaskTimeChart({ series, onClick }: TaskTimeChartProps) {
  const { data, peakIndex } = useMemo(() => {
    let peak = 0;
    let peakIdx = 0;
    const rows = series.map((d, i) => {
      const label = new Date(d.timestamp).toLocaleDateString("en-GB", {
        weekday: "short",
      });
      if (d.totalEnergyKwh > peak) {
        peak = d.totalEnergyKwh;
        peakIdx = i;
      }
      return {
        label,
        energy: Math.round(d.totalEnergyKwh * 10) / 10,
        index: i,
      };
    });
    return { data: rows, peakIndex: peakIdx };
  }, [series]);

  return (
    <AnimatedCard
      asButton
      index={4}
      onClick={onClick}
      className="panel-rich flex h-full min-h-[280px] flex-col p-6 text-left sm:p-7"
    >
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p
            className="text-[12px] font-semibold uppercase tracking-[0.1em] text-fog"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Energy time
          </p>
          <p className="mt-1 text-[15px] font-medium text-bone">Last 7 days</p>
        </div>
        <span className="pill-lime text-[11px] font-semibold">Week</span>
      </div>
      <div className="min-h-[180px] flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -20 }}>
            <XAxis
              dataKey="label"
              tick={{ fill: "#5c5c68", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis hide />
            <Tooltip
              cursor={{ fill: "rgba(184,164,245,0.08)" }}
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const v = payload[0].value as number;
                return (
                  <div className="rounded-xl border border-ink bg-char px-3 py-2 text-[13px] text-bone">
                    {formatKwh(v)}
                  </div>
                );
              }}
            />
            <Bar dataKey="energy" radius={[8, 8, 4, 4]} maxBarSize={36} isAnimationActive animationDuration={900}>
              {data.map((entry, i) => (
                <Cell
                  key={entry.label}
                  fill={
                    i === peakIndex
                      ? "var(--color-salmon)"
                      : "rgba(255,255,255,0.08)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AnimatedCard>
  );
}
