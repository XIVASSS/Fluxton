"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface RadialGaugeProps {
  /** 0–100 */
  percent: number;
  centerPrimary: string;
  centerSecondary?: string;
  label?: string;
  accentColor?: string;
}

/**
 * Lavender radial donut gauge — flight-tracker "Total weight" pattern.
 */
export function RadialGauge({
  percent,
  centerPrimary,
  centerSecondary,
  label = "IN TRANSFER",
  accentColor = "var(--color-lavender)",
}: RadialGaugeProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  const data = [
    { value: clamped },
    { value: 100 - clamped },
  ];

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[220px]">
      {label && (
        <span className="pill-lavender absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.08em]">
          {label}
        </span>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="68%"
            outerRadius="88%"
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            stroke="none"
            isAnimationActive={false}
          >
            <Cell fill={accentColor} />
            <Cell fill="rgba(255,255,255,0.06)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <p
          className="text-[22px] font-semibold leading-tight text-bone sm:text-[24px]"
          style={{ fontFamily: "var(--font-geist)" }}
        >
          {centerPrimary}
        </p>
        {centerSecondary && (
          <p className="mt-1 text-[12px] text-fog">{centerSecondary}</p>
        )}
      </div>
    </div>
  );
}
