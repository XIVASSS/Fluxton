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
}

/**
 * Live charger status counts — charging, faulted, offline, available.
 * Surfaces depot health at a glance without replacing the time-filtered KPI row.
 */
export function DepotStatusBreakdown({
  summary,
  onNavigate,
}: DepotStatusBreakdownProps) {
  if (summary.totalChargers === 0) return null;

  return (
    <AnimatedCard index={0} className="surface-soft px-4 py-4 sm:px-5 sm:py-5">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-fog">
        Charger status · live
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATUS_BREAKDOWN.map(({ key, filter }) => {
          const meta = STATUS_META[key];
          const count = summary.countsByStatus[key];
          const isProblem = key === "faulted" || key === "offline";

          return (
            <button
              key={key}
              type="button"
              onClick={() => filter && onNavigate?.(filter)}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors duration-300 ${
                isProblem && count > 0
                  ? "border-[color-mix(in_srgb,var(--color-bone)_12%,transparent)] hover:bg-iron"
                  : "border-ink hover:bg-iron"
              }`}
            >
              <span
                className="inline-flex items-center justify-center rounded-lg border border-ink p-1.5"
                style={{
                  backgroundColor: `color-mix(in srgb, ${meta.color} 14%, transparent)`,
                }}
              >
                <StatusIcon status={key} size={16} />
              </span>
              <span className="flex flex-col gap-0.5">
                <span
                  className="text-[20px] font-bold leading-none text-bone"
                  style={{ fontFamily: "var(--font-geist)" }}
                >
                  {formatNumber(count)}
                </span>
                <span className="text-[12px] text-fog">{meta.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </AnimatedCard>
  );
}
