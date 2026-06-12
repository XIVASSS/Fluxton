"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { Charger, Fault, FaultType } from "@/lib/types";
import { filterFaults, type FaultFilters } from "@/lib/selectors";
import {
  FAULT_TYPES,
  FAULT_TYPE_LABELS,
  SEVERITY_META,
} from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { AnimatedCard } from "./motion/AnimatedCard";
import { staggerItem } from "./motion/StaggerList";
import { EmptyState } from "./ui/EmptyState";
import { PillButton } from "./ui/Pill";
import { InboxIcon } from "./ui/icons";

interface FaultLogProps {
  faults: Fault[];
  chargers: Charger[];
  filters: FaultFilters;
  onFiltersChange: (next: FaultFilters) => void;
  onFaultClick?: (fault: Fault) => void;
}

/** Dark fault log with combining filters and clickable dotted rows. */
export function FaultLog({
  faults,
  chargers,
  filters,
  onFiltersChange,
  onFaultClick,
}: FaultLogProps) {
  const filtered = useMemo(
    () => filterFaults(faults, filters),
    [faults, filters],
  );

  const hasActiveFilters =
    filters.chargerId !== "all" ||
    filters.types.length > 0 ||
    filters.from !== null ||
    filters.to !== null;

  const toggleType = (type: FaultType) => {
    const next = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type];
    onFiltersChange({ ...filters, types: next });
  };

  return (
    <AnimatedCard index={0} className="panel-rich overflow-hidden p-6 sm:p-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-[12px] uppercase tracking-[0.08em] text-fog">Fault log</p>
          <h2
            className="text-[20px] font-semibold leading-none text-bone"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Depot faults
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[14px] text-mist">
            <span className="font-semibold text-bone" style={{ fontFamily: "var(--font-geist)" }}>
              {filtered.length}
            </span>{" "}
            {filtered.length === 1 ? "fault" : "faults"}
            {hasActiveFilters && <span> · filtered</span>}
          </span>
          {hasActiveFilters && (
            <PillButton
              variant="ghost"
              onClick={() =>
                onFiltersChange({ chargerId: "all", types: [], from: null, to: null })
              }
            >
              Clear
            </PillButton>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-ink bg-iron p-4">
        <div className="flex flex-wrap items-end gap-4">
          <Field label="Charger">
            <select
              value={filters.chargerId}
              onChange={(e) =>
                onFiltersChange({ ...filters, chargerId: e.target.value })
              }
              className="h-9 rounded-[10px] border border-ink bg-char px-3 text-[14px] text-bone outline-none focus:border-lavender"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              <option value="all">All chargers</option>
              {chargers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label} ({c.id})
                </option>
              ))}
            </select>
          </Field>
          <Field label="From">
            <DateInput
              value={filters.from}
              onChange={(v) => onFiltersChange({ ...filters, from: v })}
            />
          </Field>
          <Field label="To">
            <DateInput
              value={filters.to}
              onChange={(v) => onFiltersChange({ ...filters, to: v })}
            />
          </Field>
        </div>

        <Field label="Fault types (multiselect)">
          <div className="flex flex-wrap gap-2">
            {FAULT_TYPES.map((type) => {
              const selected = filters.types.includes(type);
              return (
                <motion.button
                  key={type}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleType(type)}
                  whileTap={{ scale: 0.94 }}
                  className={`rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors duration-300 ${
                    selected
                      ? "border-lavender/40 bg-lavender/15 text-bone"
                      : "border-ink text-fog hover:text-mist"
                  }`}
                  style={{ fontFamily: "var(--font-dm-sans)" }}
                >
                  {FAULT_TYPE_LABELS[type]}
                </motion.button>
              );
            })}
          </div>
        </Field>
      </div>

      <div className="mt-4">
        {faults.length === 0 ? (
          <EmptyState
            icon={<InboxIcon size={20} />}
            title="No faults recorded"
            description="The depot has a clean fault history. Faults raised by any charger will appear here."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<InboxIcon size={20} />}
            title="No faults match these filters"
            description="Try widening the date range, clearing fault-type selections, or switching back to all chargers."
            action={
              <PillButton
                variant="active"
                onClick={() =>
                  onFiltersChange({ chargerId: "all", types: [], from: null, to: null })
                }
              >
                Clear filters
              </PillButton>
            }
          />
        ) : (
          <FaultTable
            faults={filtered}
            chargers={chargers}
            onFaultClick={onFaultClick}
          />
        )}
      </div>
    </AnimatedCard>
  );
}

function FaultTable({
  faults,
  chargers,
  onFaultClick,
}: {
  faults: Fault[];
  chargers: Charger[];
  onFaultClick?: (fault: Fault) => void;
}) {
  const labelById = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of chargers) m.set(c.id, c.label);
    return m;
  }, [chargers]);

  return (
    <div className="-mr-2 max-h-[420px] overflow-y-auto pr-2">
      <table className="w-full border-collapse text-left">
        <thead className="sticky top-0 z-10 bg-char">
          <tr className="text-[12px] uppercase tracking-[0.06em] text-fog">
            <Th>Charger</Th>
            <Th>Fault type</Th>
            <Th>Severity</Th>
            <Th className="text-right">Timestamp</Th>
          </tr>
        </thead>
        <motion.tbody
          style={{ fontFamily: "var(--font-geist)" }}
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.04 } },
          }}
        >
          {faults.map((fault) => {
            const sev = SEVERITY_META[fault.severity];
            return (
              <motion.tr
                key={fault.id}
                variants={staggerItem}
                onClick={() => onFaultClick?.(fault)}
                className={`border-t border-dotted border-ink transition-colors duration-300 ${
                  onFaultClick
                    ? "cursor-pointer hover:bg-iron active:bg-slate"
                    : ""
                }`}
              >
                <td className="py-3 pr-3">
                  <span className="text-[14px] font-medium text-bone">
                    {labelById.get(fault.chargerId) ?? "—"}
                  </span>
                  <span className="ml-2 text-[12px] text-fog">{fault.chargerId}</span>
                </td>
                <td className="py-3 pr-3 text-[14px] text-mist">
                  {FAULT_TYPE_LABELS[fault.type]}
                </td>
                <td className="py-3 pr-3">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium"
                    style={{
                      color: sev.color,
                      backgroundColor: `color-mix(in srgb, ${sev.color} 14%, transparent)`,
                    }}
                  >
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: sev.color }}
                    />
                    {sev.label}
                  </span>
                </td>
                <td className="py-3 text-right text-[13px] text-mist">
                  {formatDateTime(fault.timestamp)}
                </td>
              </motion.tr>
            );
          })}
        </motion.tbody>
      </table>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] uppercase tracking-[0.06em] text-fog">{label}</span>
      {children}
    </label>
  );
}

function DateInput({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  return (
    <input
      type="date"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
      className="h-9 rounded-[10px] border border-ink bg-char px-3 text-[14px] text-bone outline-none focus:border-lavender [color-scheme:dark]"
      style={{ fontFamily: "var(--font-dm-sans)" }}
    />
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <th className={`py-2 pr-3 font-medium ${className}`}>{children}</th>;
}
