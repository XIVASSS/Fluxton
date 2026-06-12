/**
 * Export static mock JSON snapshots for submission / offline reference.
 * Run: npm run export-mock
 *
 * Timestamps are relative to generation time; re-run to refresh the snapshot.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getDepotData, SCENARIO_IDS } from "../src/lib/mock/index";

const outDir = join(process.cwd(), "mock-data");

mkdirSync(outDir, { recursive: true });

for (const scenario of SCENARIO_IDS) {
  const data = getDepotData(scenario);
  const file = join(outDir, `depot_${scenario}.json`);
  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  console.log(`Wrote ${file} (${data.chargers.length} chargers)`);
}
