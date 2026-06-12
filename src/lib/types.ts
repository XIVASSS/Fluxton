/**
 * Domain model for the EV depot dashboard.
 *
 * Realistic value ranges (used by the mock layer and documented in the README):
 *  - DC fast charging: 400-920 V, 80-500 A, up to ~350 kW
 *  - AC charging:      230-415 V, 16-32 A,  up to ~22 kW
 *  - Session energy:   ~5-90 kWh depending on connector + duration
 *
 * Power is NEVER stored on a session — it is always derived as P = V x I
 * (see `sessionPowerKw` in selectors). This keeps the mock data honest and
 * means the dashboard demonstrates a real data transformation.
 */

export type ChargerStatus = "available" | "charging" | "faulted" | "offline";

export type ConnectorType = "CCS2" | "CHAdeMO" | "Type2" | "GBT";

export type FaultSeverity = "low" | "medium" | "high" | "critical";

/**
 * Fault categories a depot manager would actually triage. Kept as a union so
 * the multiselect filter can enumerate them without scanning the data.
 */
export type FaultType =
  | "GroundFault"
  | "OverTemperature"
  | "OverCurrent"
  | "Undervoltage"
  | "CommunicationLoss"
  | "ConnectorLock"
  | "EmergencyStop";

export interface Charger {
  id: string;
  /** Human label shown on the card, e.g. "Bay A1". */
  label: string;
  connectorType: ConnectorType;
  /** Rated ceiling for this unit, in kW. Used to frame live power draw. */
  maxPowerKw: number;
  status: ChargerStatus;
  /**
   * Last heartbeat from the unit (ISO string). Always present; for `offline`
   * chargers this is the "last seen" timestamp surfaced in the detail panel.
   */
  lastSeenAt: string;
  /** Present only while `status === "charging"`. */
  activeSessionId?: string;
}

export interface Session {
  id: string;
  chargerId: string;
  /** ISO timestamp the session started. */
  startedAt: string;
  /** ISO timestamp the session ended. Absent => session is still live. */
  endedAt?: string;
  /** Instantaneous output voltage (V). */
  outputVoltageV: number;
  /** Instantaneous output current (A). */
  outputCurrentA: number;
  /** Cumulative energy delivered this session (kWh). */
  energyDeliveredKwh: number;
}

export interface Fault {
  id: string;
  chargerId: string;
  type: FaultType;
  severity: FaultSeverity;
  /** ISO timestamp the fault was raised. */
  timestamp: string;
  /** Short operator-facing description. */
  message: string;
}

/** Raw depot payload as returned by the mock API / mock module. */
export interface DepotData {
  depotId: string;
  depotName: string;
  chargers: Charger[];
  sessions: Session[];
  faults: Fault[];
}

/** Identifiers for the selectable mock datasets (drives edge-case demos). */
export type ScenarioId = "default" | "empty" | "all-faulted" | "no-faults";
