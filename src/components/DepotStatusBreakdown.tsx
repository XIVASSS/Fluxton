"use client";

import type { ChargerStatus } from "@/lib/types";
import type { DepotSummary } from "@/lib/selectors";
import { STATUS_META } from "@/lib/constants";
import { formatNumber } from "@/lib/format";
import { AnimatedCard } from "./motion/AnimatedCard";
import { StatusIcon } from "./ui/StatusIcon";

const STATUS_BREAKDOWN: {
  key: keyof DepotSummary["countsByStatus"];
  filter?: ChargerStatus;
}[] = [
  { key: "charging", filter: "charging" },
  { key: "faulted", filter: "faulted" },
  { key: "offline", filter: "offline" },
  { key: "available", filter: "available" },
];

interface DepotStatusBreakdownProps {
  summary: DepotSummary;
  onNavigate?: (filter: ChargerStatus) => void;
  /** Stagger index offset so cards animate after KPI row. */
  indexOffset?: number;
}

/**
 * Live charger status — four individual bento placards (matches KPI row above).
 */
export function DepotStatusBreakdown({
  summary,
  onNavigate,
  indexOffset = 4,
}: DepotStatusBreakdownProps) {
  if (summary.totalChargers === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <p className="px-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-fog">
        Charger status · live
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {STATUS_BREAKDOWN.map(({ key, filter }, i) => {
          const meta = STATUS_META[key];
          const count = summary.countsByStatus[key];
          const isProblem = key === "faulted" || key === "offline";
          const highlight = isProblem && count > 0;

          return (
            <AnimatedCard
              key={key}
              asButton
              index={indexOffset + i}
              onClick={() => filter && onNavigate?.(filter)}
              className={`surface-soft px-4 py-4 text-left sm:px-5 sm:py-5 ${
                highlight
                  ? "ring-1 ring-[color-mix(in_srgb,var(--color-bone)_10%,transparent)]"
                  : ""
              }`}
              style={
                highlight
                  ? {
                      boxShadow: `inset 3px 0 0 ${meta.color}`,
                    }
                  : undefined
              }
            >
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-fog">
                {meta.label}
              </p>
              <div className="flex items-center gap-2.5">
                <StatusIcon status={key} size={22} strokeWidth={1.75} />
                <p
                  className="text-[24px] font-bold leading-none sm:text-[26px]"
                  style={{
                    fontFamily: "var(--font-geist)",
                    color: meta.color,
                  }}
                >
                  {formatNumber(count)}
                </p>
              </div>
            </AnimatedCard>
          );
        })}
      </div>
    </div>
  );
}
