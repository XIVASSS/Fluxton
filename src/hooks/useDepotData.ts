"use client";

import { useEffect, useState } from "react";
import type { DepotData, ScenarioId } from "@/lib/types";

interface DepotState {
  data: DepotData | null;
  loading: boolean;
  error: string | null;
}

/**
 * Fetch depot data from the mock API for a given scenario. Re-fetches whenever
 * the scenario changes. Kept deliberately small: this is the single boundary
 * between "raw server data" and the derived selectors the UI runs on.
 */
export function useDepotData(scenario: ScenarioId): DepotState {
  const [state, setState] = useState<DepotState>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    fetch(`/api/depot?scenario=${scenario}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json() as Promise<DepotData>;
      })
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({
            data: null,
            loading: false,
            error: err instanceof Error ? err.message : "Failed to load depot data",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [scenario]);

  return state;
}
