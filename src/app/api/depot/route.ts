import { NextResponse } from "next/server";
import { getDepotData, isScenarioId } from "@/lib/mock";

/**
 * Mock depot API. No real backend — returns hardcoded (deterministically
 * generated) data. `?scenario=` selects one of the named datasets so the
 * required edge cases can be demonstrated without code changes.
 *
 *   GET /api/depot                  -> default healthy depot
 *   GET /api/depot?scenario=empty   -> no chargers
 *   GET /api/depot?scenario=all-faulted
 *   GET /api/depot?scenario=no-faults
 */
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("scenario");
  const scenario = isScenarioId(raw) ? raw : "default";
  return NextResponse.json(getDepotData(scenario));
}
