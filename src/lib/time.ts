/** Time-range model shared by the summary bar and selectors. */

export type TimeRangeId = "today" | "24h" | "7d" | "30d";

export interface TimeRange {
  id: TimeRangeId;
  label: string;
  /** Short label for the energy metric, e.g. "today", "last 7 days". */
  metricSuffix: string;
}

export const TIME_RANGES: TimeRange[] = [
  { id: "today", label: "Today", metricSuffix: "today" },
  { id: "24h", label: "24h", metricSuffix: "last 24h" },
  { id: "7d", label: "7 days", metricSuffix: "last 7 days" },
  { id: "30d", label: "30 days", metricSuffix: "last 30 days" },
];

/** Start of the local calendar day for a given timestamp. */
export function startOfDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Local YYYY-MM-DD key, used to bucket sessions into days. */
export function dayKey(ms: number): string {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Inclusive lower bound (ms) for a time range, relative to `now`.
 *  - today: midnight local time
 *  - 24h:   rolling 24 hours
 *  - 7d/30d: rolling N days
 */
export function rangeStart(id: TimeRangeId, now: number = Date.now()): number {
  switch (id) {
    case "today":
      return startOfDay(now);
    case "24h":
      return now - 24 * 60 * 60 * 1000;
    case "7d":
      return now - 7 * 24 * 60 * 60 * 1000;
    case "30d":
      return now - 30 * 24 * 60 * 60 * 1000;
  }
}
