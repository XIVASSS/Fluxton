"use client";

import { motion } from "framer-motion";
import type { Charger, Session } from "@/lib/types";
import { STATUS_META } from "@/lib/constants";
import { sessionPowerKw } from "@/lib/selectors";
import { formatRelative } from "@/lib/format";
import { StatusIcon } from "./ui/StatusIcon";

interface ChargerListRowProps {
  charger: Charger;
  liveSession?: Session;
  selected: boolean;
  onSelect: (id: string) => void;
}

/** Compact list row — one line of hierarchy for the Chargers tab. */
export function ChargerListRow({
  charger,
  liveSession,
  selected,
  onSelect,
}: ChargerListRowProps) {
  const meta = STATUS_META[charger.status];
  const powerKw = liveSession ? sessionPowerKw(liveSession) : null;

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(charger.id)}
      aria-pressed={selected}
      whileHover={{ x: 4, backgroundColor: "var(--color-iron)" }}
      whileTap={{ scale: 0.99 }}
      className={`flex w-full items-center gap-4 border-b border-ink px-4 py-3.5 text-left last:border-b-0 ${
        selected ? "bg-slate" : ""
      }`}
    >
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-lg border p-1.5 ${
          charger.status === "faulted" || charger.status === "offline"
            ? "border-[color-mix(in_srgb,var(--color-bone)_14%,transparent)]"
            : "border-ink"
        }`}
        style={{
          backgroundColor: `color-mix(in srgb, ${meta.color} 14%, transparent)`,
        }}
        aria-hidden="true"
      >
        <StatusIcon status={charger.status} size={14} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span
            className="text-[15px] font-medium text-bone"
            style={{ fontFamily: "var(--font-geist)" }}
          >
            {charger.label}
          </span>
          <span className="truncate text-[12px] text-fog">
            {charger.connectorType} · {charger.maxPowerKw} kW
          </span>
        </div>
        <span className="text-[12px] text-fog">{charger.id}</span>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-0.5">
        <span
          className="text-[13px] font-medium"
          style={{ color: meta.color }}
        >
          {meta.label}
        </span>
        {charger.status === "charging" && powerKw !== null ? (
          <span className="text-[12px] text-mist">{powerKw} kW</span>
        ) : charger.status === "offline" ? (
          <span className="text-[11px] text-fog">
            {formatRelative(charger.lastSeenAt)}
          </span>
        ) : null}
      </div>
    </motion.button>
  );
}
