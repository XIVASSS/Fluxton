"use client";

import { Bell, ChevronDown, ChevronRight, Plus, Search, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import type { ScenarioId } from "@/lib/types";
import type { DashboardTab } from "@/lib/dashboard-tabs";
import { DASHBOARD_TABS } from "@/lib/dashboard-tabs";
import { SCENARIO_IDS, SCENARIO_LABELS } from "@/lib/mock";
import type { DepotSummary } from "@/lib/selectors";
import type { TimeRangeId } from "@/lib/time";
import { TIME_RANGES } from "@/lib/time";
import { AnimatedCounter } from "./motion/AnimatedCounter";

interface AppHeaderProps {
  depotName: string;
  summary: DepotSummary;
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  timeRangeId: TimeRangeId;
  onTimeRangeChange: (id: TimeRangeId) => void;
  scenario: ScenarioId;
  onScenarioChange: (id: ScenarioId) => void;
  alertCount: number;
  onQuickAdd?: () => void;
  onSessionMonitor?: () => void;
  onFaultScanner?: () => void;
}

export function AppHeader({
  depotName,
  summary,
  activeTab,
  onTabChange,
  timeRangeId,
  onTimeRangeChange,
  scenario,
  onScenarioChange,
  alertCount,
  onQuickAdd,
  onSessionMonitor,
  onFaultScanner,
}: AppHeaderProps) {
  const { countsByStatus } = summary;
  const problems = countsByStatus.faulted + countsByStatus.offline;
  const healthPct =
    summary.totalChargers === 0
      ? 0
      : Math.round(
          ((countsByStatus.available + countsByStatus.charging) /
            summary.totalChargers) *
            100,
        );

  const statusText =
    summary.totalChargers === 0
      ? "No chargers configured"
      : problems === 0
        ? "All nominal"
        : `${countsByStatus.charging} charging · ${countsByStatus.faulted} faulted · ${countsByStatus.offline} offline`;

  return (
    <header className="mb-8 pt-5">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="surface-frost rounded-full px-4 py-2 text-[13px] text-mist">
            <AnimatedCounter
              value={healthPct}
              suffix="%"
              className="font-semibold text-[var(--color-lime)]"
            />
            <span className="text-fog"> of units operational</span>
          </div>
        </motion.div>

        <div className="flex items-center gap-2">
          <label className="hidden h-10 max-w-[220px] flex-1 items-center gap-2 rounded-full surface-frost px-4 text-fog md:flex lg:max-w-[260px]">
            <Search size={15} />
            <input
              type="text"
              placeholder="Search…"
              className="h-full w-full bg-transparent text-[13px] text-bone placeholder:text-fog focus:outline-none"
            />
          </label>

          <motion.button
            type="button"
            aria-label="Notifications"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => onTabChange("faults")}
            className="relative flex h-10 w-10 items-center justify-center rounded-full surface-frost text-ash hover:text-mist"
          >
            <Bell size={17} />
            {alertCount > 0 && (
              <span
                className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 animate-pulse items-center justify-center rounded-full px-1 text-[9px] font-bold text-paper"
                style={{ backgroundColor: "var(--color-salmon)" }}
              >
                {alertCount > 9 ? "9+" : alertCount}
              </span>
            )}
          </motion.button>

          <div className="relative">
            <select
              value={scenario}
              onChange={(e) => onScenarioChange(e.target.value as ScenarioId)}
              aria-label="Demo dataset"
              className="h-10 appearance-none rounded-full surface-frost pl-3 pr-8 text-[12px] text-mist focus:outline-none focus:ring-1 focus:ring-lavender"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              {SCENARIO_IDS.map((id) => (
                <option key={id} value={id}>
                  {SCENARIO_LABELS[id]}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-fog"
            />
          </div>
        </div>
      </div>

      <div
        className="mb-5 flex items-center gap-2 rounded-full border px-4 py-2 text-[12px] sm:hidden"
        style={{
          borderColor:
            problems > 0
              ? "color-mix(in srgb, var(--color-status-faulted) 35%, transparent)"
              : "var(--color-ink)",
          backgroundColor: "var(--color-char)",
          color: "var(--color-mist)",
        }}
      >
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{
            backgroundColor:
              problems > 0 ? "var(--color-status-faulted)" : "var(--color-lime)",
          }}
        />
        {statusText}
      </div>

      <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1
            className="text-[30px] font-semibold leading-[1.1] tracking-[-0.03em] text-bone sm:text-[36px]"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Welcome, Avery
          </h1>
          <p className="mt-2 max-w-md text-[15px] text-fog">
            {depotName} — monitor sessions, surface faults, and track energy at a glance.
          </p>
        </motion.div>

        <div className="flex flex-wrap items-center gap-2">
          <motion.button
            type="button"
            aria-label="Add action"
            onClick={onQuickAdd}
            whileHover={{ scale: 1.08, rotate: 90 }}
            whileTap={{ scale: 0.92 }}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-paper text-onyx shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
          >
            <Plus size={20} strokeWidth={2.5} />
          </motion.button>
          <QuickAction label="Session Monitor" onClick={onSessionMonitor} />
          <QuickAction label="Fault Scanner" onClick={onFaultScanner} />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav
          role="tablist"
          aria-label="Dashboard sections"
          className="relative flex items-center gap-1 rounded-full bg-[rgba(255,255,255,0.04)] p-1 backdrop-blur-sm"
        >
          {DASHBOARD_TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={active}
                onClick={() => onTabChange(tab.id)}
                className={`relative z-10 rounded-full px-4 py-2 text-[13px] font-semibold transition-colors duration-300 ${
                  active ? "text-onyx" : "text-ash hover:text-mist"
                }`}
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                {active && (
                  <motion.span
                    layoutId="tab-pill"
                    className="absolute inset-0 rounded-full bg-paper shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div
          role="tablist"
          aria-label="Time range"
          className="flex items-center gap-1 rounded-full bg-[rgba(255,255,255,0.04)] p-1 backdrop-blur-sm"
        >
          {TIME_RANGES.map((r) => {
            const active = timeRangeId === r.id;
            return (
              <motion.button
                key={r.id}
                role="tab"
                aria-selected={active}
                onClick={() => onTimeRangeChange(r.id)}
                whileTap={{ scale: 0.94 }}
                className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors duration-300 ${
                  active ? "bg-paper text-onyx" : "text-fog hover:text-mist"
                }`}
              >
                {r.label}
              </motion.button>
            );
          })}
        </div>
      </div>
    </header>
  );
}

function QuickAction({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02, x: 2 }}
      whileTap={{ scale: 0.97 }}
      className="group flex items-center gap-2 rounded-[18px] surface-frost px-4 py-3 text-[13px] font-medium text-mist hover:text-bone"
      style={{ fontFamily: "var(--font-dm-sans)" }}
    >
      <Sparkles size={14} className="text-lavender" />
      {label}
      <motion.span animate={{ x: 0 }} whileHover={{ x: 4 }}>
        <ChevronRight size={14} className="text-fog group-hover:text-mist" />
      </motion.span>
    </motion.button>
  );
}
