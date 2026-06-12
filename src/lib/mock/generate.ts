import type {
  Charger,
  ConnectorType,
  DepotData,
  Fault,
  FaultSeverity,
  FaultType,
  Session,
} from "../types";

/**
 * Deterministic mock generator.
 *
 * Timestamps are computed relative to "now" at call time so the 7-day window,
 * "energy today", and live sessions always read as current. Randomness is
 * seeded (mulberry32) so a given depot renders identically across reloads —
 * realistic but stable, which makes the UI easy to reason about and review.
 */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

interface ConnectorProfile {
  /** [minV, maxV] */
  voltage: [number, number];
  /** [minA, maxA] */
  current: [number, number];
  /** typical session minutes [min, max] */
  durationMin: [number, number];
}

/** Plausible electrical envelopes per connector family. */
const CONNECTOR_PROFILE: Record<ConnectorType, ConnectorProfile> = {
  CCS2: { voltage: [400, 920], current: [120, 350], durationMin: [25, 55] },
  CHAdeMO: { voltage: [400, 500], current: [100, 200], durationMin: [30, 60] },
  GBT: { voltage: [400, 750], current: [100, 250], durationMin: [30, 70] },
  Type2: { voltage: [230, 415], current: [16, 32], durationMin: [60, 180] },
};

interface ChargerSeed {
  id: string;
  label: string;
  connectorType: ConnectorType;
  maxPowerKw: number;
}

/** Static fleet definition — 12 bays mixing DC fast and AC destination units. */
const FLEET: ChargerSeed[] = [
  { id: "CHG-A1", label: "Bay A1", connectorType: "CCS2", maxPowerKw: 350 },
  { id: "CHG-A2", label: "Bay A2", connectorType: "CCS2", maxPowerKw: 350 },
  { id: "CHG-A3", label: "Bay A3", connectorType: "CCS2", maxPowerKw: 180 },
  { id: "CHG-A4", label: "Bay A4", connectorType: "CHAdeMO", maxPowerKw: 100 },
  { id: "CHG-A5", label: "Bay A5", connectorType: "GBT", maxPowerKw: 180 },
  { id: "CHG-A6", label: "Bay A6", connectorType: "CCS2", maxPowerKw: 350 },
  { id: "CHG-B1", label: "Bay B1", connectorType: "Type2", maxPowerKw: 22 },
  { id: "CHG-B2", label: "Bay B2", connectorType: "Type2", maxPowerKw: 22 },
  { id: "CHG-B3", label: "Bay B3", connectorType: "Type2", maxPowerKw: 11 },
  { id: "CHG-B4", label: "Bay B4", connectorType: "Type2", maxPowerKw: 11 },
  { id: "CHG-C1", label: "Bay C1", connectorType: "CCS2", maxPowerKw: 250 },
  { id: "CHG-C2", label: "Bay C2", connectorType: "GBT", maxPowerKw: 120 },
];

const FAULT_MESSAGES: Record<FaultType, string> = {
  GroundFault: "Residual current detected on output line; contactor opened.",
  OverTemperature: "Power module temperature exceeded 78°C threshold.",
  OverCurrent: "Output current exceeded connector rating; session aborted.",
  Undervoltage: "Grid input dropped below 360 V for 4s.",
  CommunicationLoss: "Lost OCPP heartbeat with vehicle / backend.",
  ConnectorLock: "Connector lock actuator failed to engage.",
  EmergencyStop: "E-stop button engaged at the bay.",
};

const FAULT_SEVERITY: Record<FaultType, FaultSeverity> = {
  GroundFault: "critical",
  OverTemperature: "high",
  OverCurrent: "high",
  Undervoltage: "medium",
  CommunicationLoss: "medium",
  ConnectorLock: "low",
  EmergencyStop: "critical",
};

function randIn(rng: () => number, [min, max]: [number, number]): number {
  return min + rng() * (max - min);
}

function round(value: number, dp = 0): number {
  const f = 10 ** dp;
  return Math.round(value * f) / f;
}

/**
 * Build one completed session with realistic V / I / energy for a connector.
 * Energy is grounded in P = V x I x time so it never contradicts the metrics
 * the detail panel derives.
 */
function buildSession(
  rng: () => number,
  charger: ChargerSeed,
  id: string,
  startedAt: number,
): Session {
  const profile = CONNECTOR_PROFILE[charger.connectorType];
  const voltage = round(randIn(rng, profile.voltage), 1);
  const current = round(randIn(rng, profile.current), 1);
  const durationMinutes = round(randIn(rng, profile.durationMin));
  const drawnKw = Math.min((voltage * current) / 1000, charger.maxPowerKw);
  // Average draw is lower than peak (ramp + taper), so scale by ~0.78.
  const energy = round((drawnKw * 0.78 * durationMinutes) / 60, 1);
  return {
    id,
    chargerId: charger.id,
    startedAt: new Date(startedAt).toISOString(),
    endedAt: new Date(startedAt + durationMinutes * 60 * 1000).toISOString(),
    outputVoltageV: voltage,
    outputCurrentA: current,
    energyDeliveredKwh: energy,
  };
}

/** A live, in-progress session (no endedAt, partial energy). */
function buildLiveSession(
  rng: () => number,
  charger: ChargerSeed,
  id: string,
  now: number,
): Session {
  const profile = CONNECTOR_PROFILE[charger.connectorType];
  const voltage = round(randIn(rng, profile.voltage), 1);
  const current = round(randIn(rng, profile.current), 1);
  const elapsedMin = round(randIn(rng, [6, 38]));
  const startedAt = now - elapsedMin * 60 * 1000;
  const drawnKw = Math.min((voltage * current) / 1000, charger.maxPowerKw);
  const energy = round((drawnKw * 0.82 * elapsedMin) / 60, 1);
  return {
    id,
    chargerId: charger.id,
    startedAt: new Date(startedAt).toISOString(),
    outputVoltageV: voltage,
    outputCurrentA: current,
    energyDeliveredKwh: energy,
  };
}

interface GenerateOptions {
  seed?: number;
  /** Which fleet indices are currently charging (live session). */
  chargingIdx?: number[];
  /** Which fleet indices are faulted right now. */
  faultedIdx?: number[];
  /** Which fleet indices are offline right now. */
  offlineIdx?: number[];
  /** Day offsets (0 = today, 6 = six days ago) that get zero sessions. */
  emptyDayOffsets?: number[];
  /** If false, generate no fault records at all. */
  withFaults?: boolean;
}

/**
 * Generate a full, internally-consistent depot dataset.
 * History spans the past 7 calendar days; `emptyDayOffsets` lets us guarantee
 * a zero-session day so the chart's zero-fill behaviour is demonstrable.
 */
export function generateDepot(options: GenerateOptions = {}): DepotData {
  const {
    seed = 42,
    chargingIdx = [0, 2, 5, 6, 10],
    faultedIdx = [3, 8],
    offlineIdx = [11],
    emptyDayOffsets = [5],
    withFaults = true,
  } = options;

  const rng = mulberry32(seed);
  const now = Date.now();

  const chargers: Charger[] = [];
  const sessions: Session[] = [];
  const faults: Fault[] = [];

  let sessionCounter = 0;
  let faultCounter = 0;

  FLEET.forEach((seedCharger, idx) => {
    const isCharging = chargingIdx.includes(idx);
    const isFaulted = faultedIdx.includes(idx);
    const isOffline = offlineIdx.includes(idx);

    const status = isFaulted
      ? "faulted"
      : isOffline
        ? "offline"
        : isCharging
          ? "charging"
          : "available";

    // Offline units last reported hours ago; everything else is recent.
    const lastSeenMs = isOffline
      ? now - randIn(rng, [4 * HOUR, 30 * HOUR])
      : now - randIn(rng, [5_000, 45_000]);

    const charger: Charger = {
      ...seedCharger,
      status,
      lastSeenAt: new Date(lastSeenMs).toISOString(),
    };

    // Historical completed sessions across the past 7 days. Sessions are
    // anchored to a specific calendar day (local midnight + an hour offset) so
    // they bucket exactly the way the usage chart groups them — this is what
    // makes a skipped `emptyDayOffsets` day a *guaranteed* zero-session day.
    for (let dayOffset = 0; dayOffset <= 6; dayOffset++) {
      if (emptyDayOffsets.includes(dayOffset)) continue;
      // Offline units stop producing sessions once they drop off; skip recent days.
      if (isOffline && dayOffset <= 1) continue;

      const midnight = new Date(now);
      midnight.setHours(0, 0, 0, 0);
      midnight.setDate(midnight.getDate() - dayOffset);
      const midnightMs = midnight.getTime();

      // Window within the day that sessions may start. For "today" we cap at
      // the current time so we never fabricate sessions in the future.
      let loHour = 6 * HOUR;
      let hiHour = 22 * HOUR;
      if (dayOffset === 0) {
        hiHour = Math.max(0, now - midnightMs - 5 * 60 * 1000);
        loHour = Math.min(loHour, Math.max(0, hiHour - HOUR));
      }
      if (hiHour <= loHour) continue; // no room for a completed session yet

      const sessionsToday = Math.floor(randIn(rng, [0, 3.2]));
      for (let s = 0; s < sessionsToday; s++) {
        const startWithinDay = midnightMs + randIn(rng, [loHour, hiHour]);
        sessionCounter += 1;
        sessions.push(
          buildSession(
            rng,
            seedCharger,
            `SES-${String(sessionCounter).padStart(4, "0")}`,
            startWithinDay,
          ),
        );
      }
    }

    // Live session for currently-charging units.
    if (isCharging) {
      sessionCounter += 1;
      const live = buildLiveSession(
        rng,
        seedCharger,
        `SES-${String(sessionCounter).padStart(4, "0")}`,
        now,
      );
      sessions.push(live);
      charger.activeSessionId = live.id;
    }

    chargers.push(charger);

    // Faults — currently-faulted units always have a fresh fault; others have
    // a sprinkling of historical faults so the log and detail panel have data.
    if (withFaults) {
      if (isFaulted) {
        const type = pickFaultType(rng, idx);
        faultCounter += 1;
        faults.push(
          buildFault(
            seedCharger.id,
            `FLT-${String(faultCounter).padStart(4, "0")}`,
            type,
            now - randIn(rng, [2 * HOUR, 20 * HOUR]),
          ),
        );
      }
      const historical = Math.floor(randIn(rng, [0, 3.4]));
      for (let f = 0; f < historical; f++) {
        const type = pickFaultType(rng, idx + f);
        faultCounter += 1;
        faults.push(
          buildFault(
            seedCharger.id,
            `FLT-${String(faultCounter).padStart(4, "0")}`,
            type,
            now - randIn(rng, [1 * HOUR, 6.5 * DAY]),
          ),
        );
      }
    }
  });

  return {
    depotId: "DPT-NORTH-01",
    depotName: "Northgate Depot",
    chargers,
    sessions,
    faults,
  };
}

const FAULT_CYCLE: FaultType[] = [
  "GroundFault",
  "OverTemperature",
  "OverCurrent",
  "Undervoltage",
  "CommunicationLoss",
  "ConnectorLock",
  "EmergencyStop",
];

function pickFaultType(rng: () => number, salt: number): FaultType {
  const i = Math.floor(rng() * FAULT_CYCLE.length + salt) % FAULT_CYCLE.length;
  return FAULT_CYCLE[i];
}

function buildFault(
  chargerId: string,
  id: string,
  type: FaultType,
  timestampMs: number,
): Fault {
  return {
    id,
    chargerId,
    type,
    severity: FAULT_SEVERITY[type],
    timestamp: new Date(timestampMs).toISOString(),
    message: FAULT_MESSAGES[type],
  };
}
