/** Primary dashboard tabs — one focused view each. */

export type DashboardTab = "overview" | "chargers" | "usage" | "faults";

export const DASHBOARD_TABS: { id: DashboardTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "chargers", label: "Chargers" },
  { id: "usage", label: "Usage" },
  { id: "faults", label: "Faults" },
];

export function isDashboardTab(value: string | null | undefined): value is DashboardTab {
  return (
    value === "overview" ||
    value === "chargers" ||
    value === "usage" ||
    value === "faults"
  );
}
