import type {
  Charger,
  ChargerStatus,
  DepotData,
  Fault,
  FaultType,
  Session,
} from "./types";
import { dayKey, rangeStart, type TimeRangeId } from "./time";

/**
 * Pure data transformations from raw depot data into the shapes each view
 * needs. Everything here is deterministic and side-effect free so the UI can
 * memoise it freely and it stays trivially testable.
 *
 * Key derivation rule: a charger's electrical power is NEVER stored — it is
 * always computed from P = V x I here.
 */

/** Instantaneous power for a session, in kW. P = V x I. */
export function sessionPowerKw(session: Session): number {
  return Math.round(((session.outputVoltageV * session.outputCurrentA) / 1000) * 10) / 10;
}

/** A session is live when it has no end timestamp. */
export function isLive(session: Session): boolean {
  return !session.endedAt;
}

/** Session elapsed/total duration in ms (uses `now` for live sessions). */
export function sessionDurationMs(session: Session, now: number = Date.now()): number {
  const start = new Date(session.startedAt).getTime();
  const end = session.endedAt ? new Date(session.endedAt).getTime() : now;
  return Math.max(0, end - start);
}

// ---------------------------------------------------------------------------
// Depot summary
// ---------------------------------------------------------------------------

export interface DepotSummary {
  totalChargers: number;
  countsByStatus: Record<ChargerStatus, number>;
  /** Sessions in progress right now (status-driven, time-range independent). */
  activeSessions: number;
  /** Energy delivered within the selected range, attributed by session start. */
  energyKwh: number;
  /** Number of sessions that started within the selected range. */
  sessionsInRange: number;
  /** Faults raised within the selected range. */
  faultsInRange: number;
}

/**
 * Compute depot-level summary.
 *
 * Charger status counts and live session count reflect the *current* state and
 * are independent of the time filter (a manager always needs to know what is
 * broken right now). Energy, session count and fault count are attributed to
 * the selected range so the summary recalculates when the filter changes.
 */
export function getDepotSummary(
  data: DepotData,
  timeRangeId: TimeRangeId,
  now: number = Date.now(),
): DepotSummary {
  const countsByStatus: Record<ChargerStatus, number> = {
    available: 0,
    charging: 0,
    faulted: 0,
    offline: 0,
  };
  for (const charger of data.chargers) {
    countsByStatus[charger.status] += 1;
  }

  const since = rangeStart(timeRangeId, now);

  let energyKwh = 0;
  let sessionsInRange = 0;
  let activeSessions = 0;

  for (const session of data.sessions) {
    if (isLive(session)) activeSessions += 1;
    const startedMs = new Date(session.startedAt).getTime();
    if (startedMs >= since) {
      energyKwh += session.energyDeliveredKwh;
      sessionsInRange += 1;
    }
  }

  const faultsInRange = data.faults.reduce((acc, fault) => {
    return new Date(fault.timestamp).getTime() >= since ? acc + 1 : acc;
  }, 0);

  return {
    totalChargers: data.chargers.length,
    countsByStatus,
    activeSessions,
    energyKwh: Math.round(energyKwh * 10) / 10,
    sessionsInRange,
    faultsInRange,
  };
}

// ---------------------------------------------------------------------------
// Usage chart (past 7 days, zero days included)
// ---------------------------------------------------------------------------

export interface UsageDay {
  /** Local day key (YYYY-MM-DD). */
  date: string;
  /** Midnight timestamp for the bucket. */
  timestamp: number;
  sessionCount: number;
  totalEnergyKwh: number;
}

/**
 * Build a continuous N-day series ending today. Every day in the window is
 * present even if it has zero sessions — buckets are pre-seeded, then filled.
 */
export function getUsageSeries(
  sessions: Session[],
  days = 7,
  now: number = Date.now(),
): UsageDay[] {
  const buckets = new Map<string, UsageDay>();
  const order: string[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const dayMs = new Date(now);
    dayMs.setHours(0, 0, 0, 0);
    dayMs.setDate(dayMs.getDate() - i);
    const key = dayKey(dayMs.getTime());
    order.push(key);
    buckets.set(key, {
      date: key,
      timestamp: dayMs.getTime(),
      sessionCount: 0,
      totalEnergyKwh: 0,
    });
  }

  for (const session of sessions) {
    const key = dayKey(new Date(session.startedAt).getTime());
    const bucket = buckets.get(key);
    if (!bucket) continue; // outside the window
    bucket.sessionCount += 1;
    bucket.totalEnergyKwh += session.energyDeliveredKwh;
  }

  return order.map((key) => {
    const b = buckets.get(key)!;
    return { ...b, totalEnergyKwh: Math.round(b.totalEnergyKwh * 10) / 10 };
  });
}

// ---------------------------------------------------------------------------
// Charger detail
// ---------------------------------------------------------------------------

export interface ActiveSessionMetrics {
  session: Session;
  voltageV: number;
  currentA: number;
  powerKw: number;
  energyKwh: number;
  durationMs: number;
}

export interface ChargerDetail {
  charger: Charger;
  /** Present when a live session exists for this charger. */
  active: ActiveSessionMetrics | null;
  /** Most recent completed session (for idle "last session" summary). */
  lastCompletedSession: Session | null;
  /** Up to 3 most recent faults for this charger (may be empty). */
  recentFaults: Fault[];
  /** Total faults recorded for this charger. */
  faultCount: number;
}

/** Build everything the detail panel needs for one charger. */
export function getChargerDetail(
  charger: Charger,
  sessions: Session[],
  faults: Fault[],
  now: number = Date.now(),
): ChargerDetail {
  const chargerSessions = sessions.filter((s) => s.chargerId === charger.id);

  const liveSession =
    chargerSessions.find(
      (s) => s.id === charger.activeSessionId && isLive(s),
    ) ?? chargerSessions.find(isLive) ?? null;

  const completed = chargerSessions
    .filter((s) => !isLive(s))
    .sort(
      (a, b) =>
        new Date(b.endedAt ?? b.startedAt).getTime() -
        new Date(a.endedAt ?? a.startedAt).getTime(),
    );

  const recentFaults = [...faults]
    .filter((f) => f.chargerId === charger.id)
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

  const active: ActiveSessionMetrics | null = liveSession
    ? {
        session: liveSession,
        voltageV: liveSession.outputVoltageV,
        currentA: liveSession.outputCurrentA,
        powerKw: sessionPowerKw(liveSession),
        energyKwh: liveSession.energyDeliveredKwh,
        durationMs: sessionDurationMs(liveSession, now),
      }
    : null;

  return {
    charger,
    active,
    lastCompletedSession: completed[0] ?? null,
    recentFaults: recentFaults.slice(0, 3),
    faultCount: recentFaults.length,
  };
}

// ---------------------------------------------------------------------------
// Fault log filtering
// ---------------------------------------------------------------------------

export interface FaultFilters {
  /** Specific charger id, or "all". */
  chargerId: string | "all";
  /** Selected fault types. Empty array => no type restriction (all types). */
  types: FaultType[];
  /** ISO date (YYYY-MM-DD) inclusive lower bound, or null. */
  from: string | null;
  /** ISO date (YYYY-MM-DD) inclusive upper bound, or null. */
  to: string | null;
}

export const EMPTY_FAULT_FILTERS: FaultFilters = {
  chargerId: "all",
  types: [],
  from: null,
  to: null,
};

/**
 * Apply all active filters with AND semantics — each filter narrows the set.
 * Returns newest-first. Date bounds are inclusive and interpreted in local
 * time (from = start of day, to = end of day).
 */
export function filterFaults(faults: Fault[], filters: FaultFilters): Fault[] {
  const fromMs = filters.from
    ? new Date(`${filters.from}T00:00:00`).getTime()
    : null;
  const toMs = filters.to
    ? new Date(`${filters.to}T23:59:59.999`).getTime()
    : null;
  const typeSet = filters.types.length ? new Set(filters.types) : null;

  return faults
    .filter((fault) => {
      if (filters.chargerId !== "all" && fault.chargerId !== filters.chargerId) {
        return false;
      }
      if (typeSet && !typeSet.has(fault.type)) return false;
      const ts = new Date(fault.timestamp).getTime();
      if (fromMs !== null && ts < fromMs) return false;
      if (toMs !== null && ts > toMs) return false;
      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
}

/** Chargers sorted so problems (faulted, then offline) lead the overview. */
export function sortChargersByPriority(
  chargers: Charger[],
  priority: Record<ChargerStatus, number>,
): Charger[] {
  return [...chargers].sort((a, b) => {
    const pa = priority[a.status];
    const pb = priority[b.status];
    if (pa !== pb) return pa - pb;
    return a.label.localeCompare(b.label);
  });
}
