"use client";

import { ArrowRight, CheckCircle2, Pause, Play } from "lucide-react";
import { motion } from "framer-motion";
import type { Charger, Fault } from "@/lib/types";
import type { DepotSummary, UsageDay } from "@/lib/selectors";
import type { TimeRange } from "@/lib/time";
import { STATUS_META } from "@/lib/constants";
import { formatKwh, formatNumber, formatRelative } from "@/lib/format";
import { UsageChart } from "../UsageChart";
import { AnimatedCard } from "../motion/AnimatedCard";
import { AnimatedCounter } from "../motion/AnimatedCounter";
import { staggerItem } from "../motion/StaggerList";
import { RadialGauge } from "../ui/RadialGauge";
import { DepotControlBar } from "../overview/DepotControlBar";
import { DepotNetworkTrack } from "../overview/DepotNetworkTrack";
import { SessionPipeline } from "../overview/SessionPipeline";
import { TaskTimeChart } from "../overview/TaskTimeChart";
import { WorkflowCtaCard } from "../overview/WorkflowCtaCard";
import { CompletedSessionsCard } from "../overview/CompletedSessionsCard";

interface OverviewTabProps {
  summary: DepotSummary;
  timeRange: TimeRange;
  usageSeries: UsageDay[];
  problemChargers: Charger[];
  chargers: Charger[];
  recentFaultByCharger: Map<string, Fault>;
  onSelectCharger: (id: string) => void;
  onNavigateChargers?: () => void;
  onNavigateUsage?: () => void;
  onNavigateFaults?: () => void;
  onNavigateCharging?: () => void;
}

export function OverviewTab({
  summary,
  timeRange,
  usageSeries,
  problemChargers,
  chargers,
  recentFaultByCharger,
  onSelectCharger,
  onNavigateChargers,
  onNavigateUsage,
  onNavigateFaults,
  onNavigateCharging,
}: OverviewTabProps) {
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

  const capacityTargetKwh = Math.max(summary.totalChargers * 80, 1);
  const energyPct = Math.min(
    100,
    Math.round((summary.energyKwh / capacityTargetKwh) * 100),
  );

  const pipelineLegs = [
    { id: "LEG-01", from: "Bay A wing", to: "Hub transfer", status: "complete" as const },
    { id: "LEG-02", from: "Hub transfer", to: "Bay C cluster", status: "active" as const },
    { id: "LEG-03", from: "Bay C cluster", to: "Grid export", status: "pending" as const },
  ];

  const resolveNodeCharger = (nodeLabel: string) => {
    const letter = nodeLabel[0];
    const match = chargers.find((c) =>
      c.label.toUpperCase().includes(`BAY ${letter}`),
    );
    if (match) onSelectCharger(match.id);
    else onNavigateChargers?.();
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <MiniStat
          index={0}
          label="Total chargers"
          value={formatNumber(summary.totalChargers)}
          onClick={onNavigateChargers}
        />
        <MiniStat
          index={1}
          label="Active sessions"
          value={formatNumber(summary.activeSessions)}
          accent="var(--color-lime)"
          onClick={onNavigateCharging}
        />
        <MiniStat
          index={2}
          label={`Energy · ${timeRange.metricSuffix}`}
          value={formatKwh(summary.energyKwh)}
          onClick={onNavigateUsage}
        />
        <MiniStat
          index={3}
          label={`Faults · ${timeRange.metricSuffix}`}
          value={formatNumber(summary.faultsInRange)}
          accent={summary.faultsInRange > 0 ? "var(--color-salmon)" : undefined}
          onClick={onNavigateFaults}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6">
        <AnimatedCard
          asButton
          index={1}
          onClick={onNavigateChargers}
          className="panel-rich flex flex-col justify-between gap-6 p-6 pt-7 text-left sm:p-8 sm:pt-9 lg:col-span-4"
        >
          <p
            className="text-[12px] font-semibold uppercase tracking-[0.1em] text-fog"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Depot efficiency
          </p>
          <p
            className="text-[72px] font-bold leading-none sm:text-[80px] text-gradient-stat"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            <AnimatedCounter value={healthPct} suffix="%" />
          </p>
          <p className="text-[14px] leading-relaxed text-mist">
            Efficiency is {healthPct >= 80 ? "above average" : "below target"}{" "}
            <span className="whitespace-nowrap">
              based on{" "}
              <span className="pill-lime inline-flex align-middle text-[12px] font-semibold">
                {summary.totalChargers} parameters
              </span>
            </span>{" "}
            across live charger status.
          </p>
        </AnimatedCard>

        <AnimatedCard
          asButton
          index={2}
          onClick={onNavigateUsage}
          className="panel-rich flex flex-col items-center justify-center gap-4 p-6 pt-7 sm:p-8 sm:pt-9 lg:col-span-4"
        >
          <div className="flex w-full items-center justify-between gap-3">
            <p
              className="text-[12px] font-semibold uppercase tracking-[0.1em] text-fog"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Energy delivered
            </p>
            <span className="pill-lavender shrink-0 text-[10px] font-semibold uppercase tracking-[0.08em]">
              {timeRange.metricSuffix.toUpperCase()}
            </span>
          </div>
          <RadialGauge
            percent={energyPct}
            centerPrimary={formatKwh(summary.energyKwh)}
            centerSecondary={`from ${formatKwh(capacityTargetKwh)} target`}
          />
        </AnimatedCard>

        <AnimatedCard index={3} className="panel-rich flex min-h-[320px] flex-col lg:col-span-4 lg:min-h-full">
          <div className="flex items-start justify-between border-b border-dotted border-ink px-5 py-4 sm:px-6">
            <div>
              <h2
                className="text-[17px] font-semibold text-bone"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                Needs attention
              </h2>
              <p className="mt-0.5 text-[13px] text-fog">
                Faulted and offline units requiring action
              </p>
            </div>
            {problems > 0 && (
              <span className="pill-lavender text-[11px] font-semibold">{problems} active</span>
            )}
          </div>
          {problemChargers.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-5 py-12 text-center">
              <CheckCircle2 size={28} style={{ color: "var(--color-lime)" }} />
              <p className="text-[15px] font-semibold text-bone">All units healthy</p>
              <p className="text-[13px] text-fog">No faulted or offline chargers right now.</p>
            </div>
          ) : (
            <motion.ul
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            >
              {problemChargers.map((c) => {
                const meta = STATUS_META[c.status];
                const fault = recentFaultByCharger.get(c.id);
                const isFaulted = c.status === "faulted";
                return (
                  <motion.li
                    key={c.id}
                    variants={staggerItem}
                    className="border-b border-dotted border-ink last:border-b-0"
                  >
                    <div className="flex items-center gap-3 px-5 py-3.5 sm:px-6">
                      <button
                        type="button"
                        onClick={() => onSelectCharger(c.id)}
                        className="min-w-0 flex-1 text-left transition-colors duration-300 hover:opacity-90"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[15px] font-semibold text-bone"
                            style={{ fontFamily: "var(--font-dm-sans)" }}
                          >
                            {c.label}
                          </span>
                          <StatusPill
                            label={meta.label}
                            tone={isFaulted ? "salmon" : "lavender"}
                          />
                        </div>
                        <p className="mt-0.5 truncate text-[13px] text-fog">
                          {fault
                            ? fault.message
                            : c.status === "offline"
                              ? `Last seen ${formatRelative(c.lastSeenAt)}`
                              : meta.label}
                        </p>
                      </button>
                      <motion.button
                        type="button"
                        onClick={() => onSelectCharger(c.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label={`Inspect ${c.label}`}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-paper text-onyx"
                      >
                        {isFaulted ? (
                          <Pause size={14} fill="currentColor" />
                        ) : (
                          <Play size={14} fill="currentColor" className="ml-0.5" />
                        )}
                      </motion.button>
                    </div>
                  </motion.li>
                );
              })}
            </motion.ul>
          )}
        </AnimatedCard>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
        <TaskTimeChart series={usageSeries} onClick={onNavigateUsage} />
        <WorkflowCtaCard onClick={onNavigateChargers} />
        <CompletedSessionsCard series={usageSeries} onClick={onNavigateUsage} />
      </div>

      <SessionPipeline
        legs={pipelineLegs}
        onLegClick={() => onNavigateChargers?.()}
      />

      <AnimatedCard index={7} className="panel-rich overflow-hidden p-5 sm:p-6">
        <p
          className="mb-4 text-[12px] font-semibold uppercase tracking-[0.1em] text-fog"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          Network track
        </p>
        <DepotNetworkTrack onNodeClick={resolveNodeCharger} />
      </AnimatedCard>

      <DepotControlBar
        currentLabel={formatKwh(summary.energyKwh)}
        totalLabel={formatKwh(capacityTargetKwh)}
        percent={energyPct}
        onPrimaryAction={onNavigateChargers}
        onSecondaryAction={onNavigateUsage}
      />

      <AnimatedCard
        asButton
        index={9}
        onClick={onNavigateUsage}
        className="panel-rich overflow-hidden text-left"
      >
        <div className="flex items-center justify-between border-b border-ink px-6 py-5 sm:px-8">
          <div>
            <h2
              className="text-[17px] font-semibold text-bone"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Usage preview
            </h2>
            <p className="text-[13px] text-fog">Last 7 days</p>
          </div>
          <span className="flex items-center gap-1 text-[13px] font-semibold text-lavender">
            View full report
            <ArrowRight size={14} />
          </span>
        </div>
        <div className="px-3 pb-4 pt-2">
          <UsageChart series={usageSeries} compact />
        </div>
      </AnimatedCard>
    </div>
  );
}

function MiniStat({
  label,
  value,
  accent,
  index,
  onClick,
}: {
  label: string;
  value: string;
  accent?: string;
  index: number;
  onClick?: () => void;
}) {
  return (
    <AnimatedCard
      asButton={!!onClick}
      index={index}
      onClick={onClick}
      className="surface-soft px-4 py-4 text-left sm:px-5 sm:py-5"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-fog">{label}</p>
      <p
        className="mt-2 text-[24px] font-bold leading-none sm:text-[26px]"
        style={{
          fontFamily: "var(--font-geist)",
          color: accent ?? "var(--color-bone)",
        }}
      >
        {value}
      </p>
    </AnimatedCard>
  );
}

function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone: "lavender" | "salmon";
}) {
  const cls = tone === "lavender" ? "pill-lavender" : "pill-salmon";
  return (
    <span className={`${cls} text-[10px] font-semibold uppercase tracking-wide`}>{label}</span>
  );
}
