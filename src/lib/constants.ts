import type {
  ChargerStatus,
  FaultSeverity,
  FaultType,
} from "./types";

/** Display metadata for each charger status (label + semantic color token). */
export const STATUS_META: Record<
  ChargerStatus,
  { label: string; color: string; tone: "ok" | "active" | "warn" | "critical" }
> = {
  available: { label: "Available", color: "var(--color-status-available)", tone: "ok" },
  charging: { label: "Charging", color: "var(--color-status-charging)", tone: "active" },
  faulted: { label: "Faulted", color: "var(--color-status-faulted)", tone: "critical" },
  offline: { label: "Offline", color: "var(--color-status-offline)", tone: "warn" },
};

/**
 * Sort weight so problems float to the top of the overview without scanning.
 * Lower number = higher priority.
 */
export const STATUS_PRIORITY: Record<ChargerStatus, number> = {
  faulted: 0,
  offline: 1,
  charging: 2,
  available: 3,
};

/** All fault types, used to populate the multiselect without scanning data. */
export const FAULT_TYPES: FaultType[] = [
  "GroundFault",
  "OverTemperature",
  "OverCurrent",
  "Undervoltage",
  "CommunicationLoss",
  "ConnectorLock",
  "EmergencyStop",
];

export const FAULT_TYPE_LABELS: Record<FaultType, string> = {
  GroundFault: "Ground Fault",
  OverTemperature: "Over Temperature",
  OverCurrent: "Over Current",
  Undervoltage: "Undervoltage",
  CommunicationLoss: "Communication Loss",
  ConnectorLock: "Connector Lock",
  EmergencyStop: "Emergency Stop",
};

export const SEVERITY_META: Record<
  FaultSeverity,
  { label: string; color: string; rank: number }
> = {
  critical: { label: "Critical", color: "var(--color-status-faulted)", rank: 3 },
  high: { label: "High", color: "#f08a3c", rank: 2 },
  medium: { label: "Medium", color: "var(--color-status-offline)", rank: 1 },
  low: { label: "Low", color: "var(--color-mist)", rank: 0 },
};
