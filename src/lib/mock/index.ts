import type { DepotData, ScenarioId } from "../types";
import { generateDepot } from "./generate";

/**
 * Named mock datasets. Each is a thunk so timestamps stay relative to the
 * moment the data is requested (keeps the 7-day window and "today" current).
 *
 * Edge-case scenarios are first-class here so the required states can be
 * demonstrated by switching `?scenario=` rather than hand-editing data.
 */
const SCENARIOS: Record<ScenarioId, () => DepotData> = {
  // Healthy, busy depot with a realistic mix of statuses + one zero-session day.
  default: () => generateDepot(),

  // No chargers configured — exercises every empty state.
  empty: () => ({
    depotId: "DPT-NEW-00",
    depotName: "Unconfigured Depot",
    chargers: [],
    sessions: [],
    faults: [],
  }),

  // Every charger faulted at once — summary + overview must scream.
  "all-faulted": () =>
    generateDepot({
      seed: 7,
      chargingIdx: [],
      offlineIdx: [],
      faultedIdx: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      emptyDayOffsets: [5],
    }),

  // Chargers present but zero fault history anywhere — detail/log must not break.
  "no-faults": () =>
    generateDepot({
      seed: 13,
      faultedIdx: [],
      offlineIdx: [],
      withFaults: false,
    }),
};

export function isScenarioId(value: string | null | undefined): value is ScenarioId {
  return (
    value === "default" ||
    value === "empty" ||
    value === "all-faulted" ||
    value === "no-faults"
  );
}

export function getDepotData(scenario: ScenarioId = "default"): DepotData {
  return SCENARIOS[scenario]();
}

export const SCENARIO_IDS: ScenarioId[] = [
  "default",
  "empty",
  "all-faulted",
  "no-faults",
];

export const SCENARIO_LABELS: Record<ScenarioId, string> = {
  default: "Healthy depot",
  empty: "No chargers",
  "all-faulted": "All faulted",
  "no-faults": "No fault history",
};
