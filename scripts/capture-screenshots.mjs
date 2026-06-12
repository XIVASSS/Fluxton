import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3005";
const OUT = "screenshots";

const scenarios = ["default", "empty", "all-faulted", "no-faults"];
const tabs = ["overview", "chargers", "usage", "faults"];

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

for (const scenario of scenarios) {
  for (const tab of tabs) {
    const params = new URLSearchParams();
    if (scenario !== "default") params.set("scenario", scenario);
    if (tab !== "overview") params.set("tab", tab);
    const qs = params.toString();
    const url = `${BASE}/${qs ? `?${qs}` : ""}`;
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    const name = `${scenario}-${tab}.png`;
    await page.screenshot({ path: `${OUT}/${name}`, fullPage: true });
    console.log(`saved ${name}`);
  }
}

await browser.close();
