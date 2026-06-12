"use client";

import { useMemo } from "react";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { UsageDay } from "@/lib/selectors";
import { formatKwh, formatNumber } from "@/lib/format";
import { GlassCard, SectionLabel } from "./ui/GlassCard";

interface UsageChartProps {
  series: UsageDay[];
  /** Smaller chart for Overview tab preview. */
  compact?: boolean;
}

const SESSIONS_COLOR = "rgba(255,255,255,0.12)";
const ENERGY_COLOR = "#b8a4f5";
const ENERGY_FILL = "#c8ff4a";

/**
 * 7-day usage: sessions (bars, left axis) + energy kWh (line, right axis) on a
 * shared chart. Every day in the window is present — including zero-session
 * days — because the series is pre-bucketed by the selector. Hover shows exact
 * values via a custom glass tooltip.
 */
export function UsageChart({ series, compact = false }: UsageChartProps) {
  const data = useMemo(
    () =>
      series.map((d) => ({
        ...d,
        label: new Date(d.timestamp).toLocaleDateString("en-GB", {
          weekday: "short",
          day: "2-digit",
        }),
      })),
    [series],
  );

  const totals = useMemo(
    () =>
      series.reduce(
        (acc, d) => ({
          sessions: acc.sessions + d.sessionCount,
          energy: Math.round((acc.energy + d.totalEnergyKwh) * 10) / 10,
        }),
        { sessions: 0, energy: 0 },
      ),
    [series],
  );

  const allZero = totals.sessions === 0 && totals.energy === 0;

  const inner = (
    <>
      {!compact && (
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3 px-5 pt-5">
          <div className="flex flex-col gap-1">
            <SectionLabel>Usage · last 7 days</SectionLabel>
            <h2
              className="text-[20px] leading-none text-bone"
              style={{ fontFamily: "var(--font-geist)", fontWeight: 500 }}
            >
              Sessions &amp; energy delivered
            </h2>
          </div>
          <div className="flex items-center gap-5">
            <LegendItem color={SESSIONS_COLOR} shape="bar" label="Sessions" />
            <LegendItem color={ENERGY_COLOR} shape="line" label="Energy (kWh)" />
          </div>
        </div>
      )}

      <div className={`relative w-full ${compact ? "h-[160px]" : "h-[280px] px-2 pb-4"}`}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 8, right: 8, bottom: 0, left: -8 }}
          >
            <defs>
              <linearGradient id="usage-energy-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={ENERGY_COLOR} stopOpacity={0.35} />
                <stop offset="100%" stopColor={ENERGY_COLOR} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="usage-bar-accent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={ENERGY_FILL} stopOpacity={0.5} />
                <stop offset="100%" stopColor={SESSIONS_COLOR} stopOpacity={0.8} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="label"
              tick={{ fill: "#5c5c68", fontSize: compact ? 10 : 12 }}
              tickLine={false}
              axisLine={{ stroke: "#222226" }}
            />
            <YAxis
              yAxisId="left"
              allowDecimals={false}
              tick={{ fill: "#5c5c68", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={36}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: "#5c5c68", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={44}
              tickFormatter={(v: number) => `${v}`}
            />
            <Tooltip
              cursor={{ fill: "rgba(184,164,245,0.08)" }}
              content={<UsageTooltip />}
            />
            <Bar
              yAxisId="left"
              dataKey="sessionCount"
              name="Sessions"
              fill="url(#usage-bar-accent)"
              fillOpacity={0.9}
              radius={[6, 6, 0, 0]}
              maxBarSize={34}
              isAnimationActive
              animationDuration={800}
              animationEasing="ease-out"
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="totalEnergyKwh"
              name="Energy"
              stroke={ENERGY_COLOR}
              strokeWidth={compact ? 2 : 2.5}
              fill="url(#usage-energy-fill)"
              dot={compact ? false : { r: 3, fill: ENERGY_COLOR, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              isAnimationActive
              animationDuration={800}
              animationEasing="ease-out"
            />
          </ComposedChart>
        </ResponsiveContainer>

        {allZero && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="rounded-[9999px] border border-[color-mix(in_srgb,var(--color-bone)_10%,transparent)] bg-[color-mix(in_srgb,var(--color-void)_70%,transparent)] px-4 py-1.5 text-[13px] text-fog">
              No sessions in the last 7 days
            </span>
          </div>
        )}
      </div>
    </>
  );

  if (compact) return inner;
  return <GlassCard>{inner}</GlassCard>;
}

interface TooltipPayloadItem {
  payload: UsageDay & { label: string };
}

/** Custom glass tooltip showing exact session + energy values for the day. */
function UsageTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  const day = payload[0].payload;
  const full = new Date(day.timestamp).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "short",
  });

  return (
    <div className="glass rounded-[12px] px-3.5 py-3" style={{ minWidth: 168 }}>
      <p
        className="mb-2 text-[13px] text-bone"
        style={{ fontFamily: "var(--font-geist)" }}
      >
        {full}
      </p>
      <div className="flex items-center justify-between gap-6 text-[13px]">
        <span className="flex items-center gap-2 text-mist">
          <span
            className="inline-block h-2 w-2 rounded-[2px]"
            style={{ backgroundColor: SESSIONS_COLOR }}
          />
          Sessions
        </span>
        <span className="text-bone" style={{ fontFamily: "var(--font-geist)" }}>
          {formatNumber(day.sessionCount)}
        </span>
      </div>
      <div className="mt-1.5 flex items-center justify-between gap-6 text-[13px]">
        <span className="flex items-center gap-2 text-mist">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: ENERGY_COLOR }}
          />
          Energy
        </span>
        <span className="text-bone" style={{ fontFamily: "var(--font-geist)" }}>
          {formatKwh(day.totalEnergyKwh)}
        </span>
      </div>
    </div>
  );
}

function LegendItem({
  color,
  shape,
  label,
}: {
  color: string;
  shape: "bar" | "line";
  label: string;
}) {
  return (
    <span className="flex items-center gap-2 text-[13px] text-mist">
      <span
        className="inline-block"
        style={{
          width: 12,
          height: shape === "bar" ? 12 : 3,
          borderRadius: shape === "bar" ? 3 : 9999,
          backgroundColor: color,
          opacity: shape === "bar" ? 0.55 : 1,
        }}
      />
      {label}
    </span>
  );
}
