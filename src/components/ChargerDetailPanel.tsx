"use client";

import { useEffect, useState } from "react";
import type { ChargerDetail } from "@/lib/selectors";
import { sessionDurationMs } from "@/lib/selectors";
import { STATUS_META, FAULT_TYPE_LABELS, SEVERITY_META } from "@/lib/constants";
import {
  formatDateTime,
  formatDuration,
  formatKwh,
  formatRelative,
} from "@/lib/format";
import type { Fault } from "@/lib/types";
import { GlassCard, SectionLabel } from "./ui/GlassCard";
import { EmptyState } from "./ui/EmptyState";
import { StatusBadge } from "./ui/StatusBadge";
import {
  AlertTriangleIcon,
  CheckIcon,
  GaugeIcon,
  PlugIcon,
  PowerOffIcon,
} from "./ui/icons";

interface ChargerDetailPanelProps {
  detail: ChargerDetail | null;
  onClose: () => void;
  /** When true, skip outer GlassCard — sits inside a parent panel. */
  embedded?: boolean;
}

function PanelShell({
  embedded,
  children,
  className = "",
}: {
  embedded?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  if (embedded) {
    return <div className={`flex h-full min-h-[320px] flex-col p-5 ${className}`}>{children}</div>;
  }
  return <GlassCard className={`flex h-full flex-col ${className}`}>{children}</GlassCard>;
}

/**
 * Detail view for the selected charger. Branches into one of three clear
 * states — active session, idle (with last-session summary), or offline (with
 * last-seen) — and always renders the recent-fault section, gracefully when
 * the charger has no fault history.
 */
export function ChargerDetailPanel({
  detail,
  onClose,
  embedded = false,
}: ChargerDetailPanelProps) {
  if (!detail) {
    return (
      <PanelShell embedded={embedded}>
        {!embedded && <SectionLabel>Charger detail</SectionLabel>}
        <div className="flex flex-1 items-center">
          <EmptyState
            icon={<PlugIcon size={20} />}
            title="Select a charger"
            description="Choose a unit from the list to inspect live session metrics and fault history."
          />
        </div>
      </PanelShell>
    );
  }

  const { charger } = detail;
  const meta = STATUS_META[charger.status];

  return (
    <PanelShell embedded={embedded}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2
            className="text-[22px] font-medium leading-none text-bone"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            {charger.label}
          </h2>
          <span className="text-[13px] text-fog">
            {charger.id} · {charger.connectorType} · {charger.maxPowerKw} kW
          </span>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={charger.status} size="sm" />
          {!embedded && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Clear selection"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-ink text-ash hover:text-bone"
            >
              <span className="text-[16px] leading-none">×</span>
            </button>
          )}
        </div>
      </div>

      <div className="my-5 hairline" />

      <div className="flex flex-1 flex-col gap-6">
        {/* Primary state region */}
        {detail.active ? (
          <ActiveSessionView detail={detail} accent={meta.color} />
        ) : charger.status === "offline" ? (
          <OfflineView detail={detail} />
        ) : charger.status === "faulted" ? (
          <FaultedView detail={detail} />
        ) : (
          <IdleView detail={detail} />
        )}

        {/* Fault history — always present, graceful when empty */}
        <RecentFaults faults={detail.recentFaults} total={detail.faultCount} />
      </div>
    </PanelShell>
  );
}

/** Live session metrics, including derived power P = V x I. */
function ActiveSessionView({
  detail,
  accent,
}: {
  detail: ChargerDetail;
  accent: string;
}) {
  const active = detail.active!;
  // Tick once a second so the live duration advances.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const durationMs = sessionDurationMs(active.session, now);

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <SectionLabel>Active session</SectionLabel>
        <span
          className="inline-flex items-center gap-1.5 text-[12px]"
          style={{ color: accent }}
        >
          <span className="relative inline-flex h-2 w-2">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
              style={{ backgroundColor: accent }}
            />
            <span
              className="relative inline-flex h-2 w-2 rounded-full"
              style={{ backgroundColor: accent }}
            />
          </span>
          Live · started {formatDateTime(active.session.startedAt)}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Metric label="Output voltage" value={`${active.voltageV}`} unit="V" />
        <Metric label="Output current" value={`${active.currentA}`} unit="A" />
        <Metric
          label="Power (V × I)"
          value={`${active.powerKw}`}
          unit="kW"
          emphasis
        />
        <Metric
          label="Energy this session"
          value={active.energyKwh.toLocaleString("en-US", {
            maximumFractionDigits: 1,
          })}
          unit="kWh"
        />
        <Metric label="Duration" value={formatDuration(durationMs)} />
      </div>
    </section>
  );
}

/** Idle state — no live session, summarise the most recent completed one. */
function IdleView({ detail }: { detail: ChargerDetail }) {
  const last = detail.lastCompletedSession;
  return (
    <section>
      <div className="mb-3 flex items-center gap-2 text-ash">
        <GaugeIcon size={16} />
        <SectionLabel>Idle — no active session</SectionLabel>
      </div>
      {last ? (
        <div className="rounded-[16px] border border-[color-mix(in_srgb,var(--color-bone)_8%,transparent)] bg-[color-mix(in_srgb,var(--color-void)_45%,transparent)] p-4">
          <p className="mb-3 text-[13px] text-fog">
            Last session ended {formatRelative(last.endedAt ?? last.startedAt)}
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Metric
              label="Energy delivered"
              value={last.energyDeliveredKwh.toLocaleString("en-US", {
                maximumFractionDigits: 1,
              })}
              unit="kWh"
            />
            <Metric label="Peak voltage" value={`${last.outputVoltageV}`} unit="V" />
            <Metric label="Peak current" value={`${last.outputCurrentA}`} unit="A" />
          </div>
        </div>
      ) : (
        <EmptyState
          compact
          icon={<CheckIcon size={18} />}
          title="No sessions recorded yet"
          description="This charger is ready and has not run a session in the available history."
        />
      )}
    </section>
  );
}

/** Faulted state — surface the fault prominently, plus last-session context. */
function FaultedView({ detail }: { detail: ChargerDetail }) {
  const { lastCompletedSession } = detail;
  const latest = detail.recentFaults[0];
  return (
    <section>
      <div
        className="rounded-[16px] border p-4"
        style={{
          borderColor: "color-mix(in srgb, var(--color-status-faulted) 50%, transparent)",
          backgroundColor: "color-mix(in srgb, var(--color-status-faulted) 10%, transparent)",
        }}
      >
        <div
          className="mb-2 flex items-center gap-2"
          style={{ color: "var(--color-status-faulted)" }}
        >
          <AlertTriangleIcon size={16} />
          <span className="text-[14px] font-medium">Charger faulted — session halted</span>
        </div>
        <p className="text-[14px] text-mist">
          {latest
            ? latest.message
            : "This charger has reported a fault and is not delivering power."}
        </p>
      </div>

      {lastCompletedSession && (
        <div className="mt-4">
          <SectionLabel>Last completed session</SectionLabel>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Metric
              label="Energy delivered"
              value={lastCompletedSession.energyDeliveredKwh.toLocaleString("en-US", {
                maximumFractionDigits: 1,
              })}
              unit="kWh"
            />
            <Metric label="Voltage" value={`${lastCompletedSession.outputVoltageV}`} unit="V" />
            <Metric label="Current" value={`${lastCompletedSession.outputCurrentA}`} unit="A" />
          </div>
        </div>
      )}
    </section>
  );
}

/** Offline state — emphasise last-seen so staleness is unmistakable. */
function OfflineView({ detail }: { detail: ChargerDetail }) {
  const { charger, lastCompletedSession } = detail;
  return (
    <section>
      <div
        className="rounded-[16px] border p-4"
        style={{
          borderColor: "color-mix(in srgb, var(--color-status-offline) 45%, transparent)",
          backgroundColor: "color-mix(in srgb, var(--color-status-offline) 9%, transparent)",
        }}
      >
        <div
          className="mb-2 flex items-center gap-2"
          style={{ color: "var(--color-status-offline)" }}
        >
          <PowerOffIcon size={16} />
          <span className="text-[14px] font-medium">Charger offline</span>
        </div>
        <p className="text-[14px] text-mist">
          No heartbeat received. Last seen{" "}
          <span className="text-bone">{formatRelative(charger.lastSeenAt)}</span>{" "}
          <span className="text-fog">({formatDateTime(charger.lastSeenAt)})</span>.
        </p>
      </div>

      {lastCompletedSession && (
        <div className="mt-4">
          <SectionLabel>Last known session</SectionLabel>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Metric
              label="Energy delivered"
              value={lastCompletedSession.energyDeliveredKwh.toLocaleString("en-US", {
                maximumFractionDigits: 1,
              })}
              unit="kWh"
            />
            <Metric
              label="Voltage"
              value={`${lastCompletedSession.outputVoltageV}`}
              unit="V"
            />
            <Metric
              label="Current"
              value={`${lastCompletedSession.outputCurrentA}`}
              unit="A"
            />
          </div>
        </div>
      )}
    </section>
  );
}

function RecentFaults({ faults, total }: { faults: Fault[]; total: number }) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <SectionLabel>Recent faults</SectionLabel>
        {total > 0 && (
          <span className="text-[12px] text-fog">
            showing {faults.length} of {total}
          </span>
        )}
      </div>
      {faults.length === 0 ? (
        <div className="flex items-center gap-2 rounded-[14px] border border-[color-mix(in_srgb,var(--color-bone)_8%,transparent)] bg-[color-mix(in_srgb,var(--color-void)_45%,transparent)] px-4 py-3 text-[14px] text-mist">
          <span style={{ color: "var(--color-status-charging)" }}>
            <CheckIcon size={16} />
          </span>
          No faults on record for this charger.
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {faults.map((fault) => {
            const sev = SEVERITY_META[fault.severity];
            return (
              <li
                key={fault.id}
                className="flex items-start gap-3 rounded-[14px] border border-[color-mix(in_srgb,var(--color-bone)_8%,transparent)] bg-[color-mix(in_srgb,var(--color-void)_45%,transparent)] px-4 py-3"
              >
                <span className="mt-0.5" style={{ color: sev.color }}>
                  <AlertTriangleIcon size={16} />
                </span>
                <div className="flex flex-1 flex-col gap-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="text-[14px] text-bone"
                      style={{ fontFamily: "var(--font-geist)" }}
                    >
                      {FAULT_TYPE_LABELS[fault.type]}
                    </span>
                    <span
                      className="rounded-[9999px] px-2 py-0.5 text-[11px] font-medium"
                      style={{
                        color: sev.color,
                        backgroundColor: `color-mix(in srgb, ${sev.color} 14%, transparent)`,
                      }}
                    >
                      {sev.label}
                    </span>
                  </div>
                  <span className="text-[13px] text-fog">{fault.message}</span>
                  <span className="text-[12px] text-fog">
                    {formatDateTime(fault.timestamp)} · {formatRelative(fault.timestamp)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/** A single metric tile — large value in Geist, small label + unit. */
function Metric({
  label,
  value,
  unit,
  emphasis = false,
}: {
  label: string;
  value: string;
  unit?: string;
  emphasis?: boolean;
}) {
  return (
    <div className="rounded-xl border border-ink bg-iron p-3.5">
      <p className="text-[12px] uppercase tracking-[0.06em] text-fog">{label}</p>
      <p
        className="mt-1.5 flex items-baseline gap-1 leading-none text-bone"
        style={{ fontFamily: "var(--font-geist)" }}
      >
        <span className={emphasis ? "text-[28px]" : "text-[24px]"}>{value}</span>
        {unit && <span className="text-[13px] text-mist">{unit}</span>}
      </p>
    </div>
  );
}
