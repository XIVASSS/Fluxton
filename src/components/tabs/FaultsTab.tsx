"use client";

import type { Charger, Fault } from "@/lib/types";
import type { FaultFilters } from "@/lib/selectors";
import { FaultLog } from "../FaultLog";

interface FaultsTabProps {
  faults: Fault[];
  chargers: Charger[];
  filters: FaultFilters;
  onFiltersChange: (next: FaultFilters) => void;
  onFaultClick?: (fault: Fault) => void;
}

/** Full-width dark fault log. */
export function FaultsTab({
  faults,
  chargers,
  filters,
  onFiltersChange,
  onFaultClick,
}: FaultsTabProps) {
  return (
    <FaultLog
      faults={faults}
      chargers={chargers}
      filters={filters}
      onFiltersChange={onFiltersChange}
      onFaultClick={onFaultClick}
    />
  );
}
