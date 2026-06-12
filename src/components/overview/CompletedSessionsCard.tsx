"use client";

import { useMemo } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import type { UsageDay } from "@/lib/selectors";
import { AnimatedCard } from "../motion/AnimatedCard";

interface CompletedSessionsCardProps {
  series: UsageDay[];
  onClick?: () => void;
}

/** Lavender card with white line chart — Mytasky "Completed Tasks" pattern. */
export function CompletedSessionsCard({ series, onClick }: CompletedSessionsCardProps) {
  const { data, trendPct, latestCount } = useMemo(() => {
    const rows = series.map((d) => ({
      label: new Date(d.timestamp).toLocaleDateString("en-GB", { weekday: "short" }),
      sessions: d.sessionCount,
    }));
    const last = rows[rows.length - 1]?.sessions ?? 0;
    const prev = rows[rows.length - 2]?.sessions ?? 0;
    const trend =
      prev === 0 ? (last > 0 ? 100 : 0) : Math.round(((last - prev) / prev) * 100);
    return { data: rows, trendPct: trend, latestCount: last };
  }, [series]);

  return (
    <AnimatedCard
      asButton
      index={6}
      onClick={onClick}
      className="relative flex min-h-[280px] flex-col overflow-hidden rounded-[28px] p-6 text-left sm:p-7"
      style={{
        background:
          "linear-gradient(165deg, color-mix(in srgb, var(--color-lavender) 85%, white) 0%, var(--color-lavender) 100%)",
      }}
    >
      <div className="mb-2 flex items-start justify-between">
        <div>
          <p
            className="text-[12px] font-bold uppercase tracking-[0.1em] text-onyx/60"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Completed sessions
          </p>
          <span className="mt-2 inline-flex rounded-full bg-paper/25 px-2.5 py-1 text-[11px] font-bold text-onyx">
            {trendPct >= 0 ? "+" : ""}
            {trendPct}% today
          </span>
        </div>
        <span className="rounded-full bg-paper/20 px-3 py-1 text-[11px] font-semibold text-onyx">
          Week
        </span>
      </div>
      <div className="relative min-h-[140px] flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 16, right: 8, bottom: 0, left: -16 }}>
            <XAxis
              dataKey="label"
              tick={{ fill: "rgba(0,0,0,0.45)", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                return (
                  <div className="rounded-full bg-onyx px-3 py-1.5 text-[13px] font-bold text-paper">
                    {payload[0].value}
                  </div>
                );
              }}
            />
            <Line
              type="monotone"
              dataKey="sessions"
              stroke="#ffffff"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 6, fill: "#fff", stroke: "#0c0c0e", strokeWidth: 2 }}
              isAnimationActive
              animationDuration={1200}
            />
          </LineChart>
        </ResponsiveContainer>
        {latestCount > 0 && (
          <div className="pointer-events-none absolute right-[12%] top-[28%] flex flex-col items-center">
            <span className="rounded-full bg-onyx px-2.5 py-1 text-[12px] font-bold text-paper shadow-lg">
              {latestCount}
            </span>
          </div>
        )}
      </div>
    </AnimatedCard>
  );
}
