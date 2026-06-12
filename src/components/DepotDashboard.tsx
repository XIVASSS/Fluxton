"use client";

import { useEffect, useMemo, useState } from "react";
import type { ScenarioId, Fault, ChargerStatus } from "@/lib/types";
import { isScenarioId } from "@/lib/mock";
import { STATUS_PRIORITY } from "@/lib/constants";
import {
  EMPTY_FAULT_FILTERS,
  getChargerDetail,
  getDepotSummary,
  getUsageSeries,
  sortChargersByPriority,
  type FaultFilters,
} from "@/lib/selectors";
import { TIME_RANGES, type TimeRangeId } from "@/lib/time";
import type { DashboardTab } from "@/lib/dashboard-tabs";
import { isDashboardTab } from "@/lib/dashboard-tabs";
import { useDepotData } from "@/hooks/useDepotData";
import { IconRail } from "./IconRail";
import { AppHeader } from "./AppHeader";
import { TabPanel } from "./motion/TabPanel";
import { OverviewTab } from "./tabs/OverviewTab";
import { ChargersTab } from "./tabs/ChargersTab";
import { UsageTab } from "./tabs/UsageTab";
import { FaultsTab } from "./tabs/FaultsTab";

type ChargerFilter = "all" | ChargerStatus;

export function DepotDashboard() {
  const [scenario, setScenario] = useState<ScenarioId>("default");
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const { data, loading, error } = useDepotData(scenario);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rawScenario = params.get("scenario");
    if (isScenarioId(rawScenario) && rawScenario !== "default") {
      setScenario(rawScenario);
    }
    const rawTab = params.get("tab");
    if (isDashboardTab(rawTab)) setActiveTab(rawTab);
  }, []);

  const changeScenario = (next: ScenarioId) => {
    setScenario(next);
    syncUrl({ scenario: next, tab: activeTab });
  };

  const changeTab = (next: DashboardTab) => {
    setActiveTab(next);
    syncUrl({ scenario, tab: next });
  };

  const [selectedChargerId, setSelectedChargerId] = useState<string | null>(null);
  const [timeRangeId, setTimeRangeId] = useState<TimeRangeId>("today");
  const [faultFilters, setFaultFilters] = useState<FaultFilters>(EMPTY_FAULT_FILTERS);
  const [chargerFilter, setChargerFilter] = useState<ChargerFilter>("all");

  useEffect(() => {
    if (!data) return;
    setFaultFilters(EMPTY_FAULT_FILTERS);
    if (data.chargers.length === 0) {
      setSelectedChargerId(null);
      return;
    }
    const [top] = sortChargersByPriority(data.chargers, STATUS_PRIORITY);
    setSelectedChargerId(top?.id ?? null);
  }, [data]);

  const timeRange = useMemo(
    () => TIME_RANGES.find((r) => r.id === timeRangeId) ?? TIME_RANGES[0],
    [timeRangeId],
  );

  const summary = useMemo(
    () => (data ? getDepotSummary(data, timeRangeId) : null),
    [data, timeRangeId],
  );

  const usageSeries = useMemo(
    () => (data ? getUsageSeries(data.sessions, 7) : []),
    [data],
  );

  const problemChargers = useMemo(() => {
    if (!data) return [];
    return sortChargersByPriority(
      data.chargers.filter((c) => c.status === "faulted" || c.status === "offline"),
      STATUS_PRIORITY,
    );
  }, [data]);

  const recentFaultByCharger = useMemo(() => {
    const map = new Map<string, Fault>();
    if (!data) return map;
    for (const f of [...data.faults].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )) {
      if (!map.has(f.chargerId)) map.set(f.chargerId, f);
    }
    return map;
  }, [data]);

  const selectedDetail = useMemo(() => {
    if (!data || !selectedChargerId) return null;
    const charger = data.chargers.find((c) => c.id === selectedChargerId);
    if (!charger) return null;
    return getChargerDetail(charger, data.sessions, data.faults);
  }, [data, selectedChargerId]);

  const goToChargers = (chargerId?: string, filter: ChargerFilter = "all") => {
    if (chargerId) setSelectedChargerId(chargerId);
    setChargerFilter(filter);
    changeTab("chargers");
  };

  const handleSelectFromOverview = (id: string) => {
    goToChargers(id);
  };

  const handleFaultClick = (fault: Fault) => {
    goToChargers(fault.chargerId);
  };

  const depotName = data?.depotName ?? "Depot";

  return (
    <div className="app-shell relative z-10 min-h-screen">
      <IconRail
        activeTab={activeTab}
        onTabChange={changeTab}
        faultCount={data?.faults.length ?? 0}
      />

      <div className="seamless-main lg:pl-[72px]">
        <div className="mx-auto w-full max-w-[1200px] px-4 pb-16 sm:px-8">
          {loading && !data ? (
            <LoadingState />
          ) : error ? (
            <div className="panel mt-8 p-6">
              <p style={{ color: "var(--color-status-faulted)" }}>
                Failed to load depot data: {error}
              </p>
            </div>
          ) : data && summary ? (
            <>
              <AppHeader
                depotName={depotName}
                summary={summary}
                activeTab={activeTab}
                onTabChange={changeTab}
                timeRangeId={timeRangeId}
                onTimeRangeChange={setTimeRangeId}
                scenario={scenario}
                onScenarioChange={changeScenario}
                alertCount={
                  summary.countsByStatus.faulted + summary.countsByStatus.offline
                }
                onQuickAdd={() => goToChargers()}
                onSessionMonitor={() => changeTab("usage")}
                onFaultScanner={() => changeTab("faults")}
              />

              <TabPanel tabKey={activeTab}>
                {activeTab === "overview" && (
                  <OverviewTab
                    summary={summary}
                    timeRange={timeRange}
                    usageSeries={usageSeries}
                    problemChargers={problemChargers}
                    chargers={data.chargers}
                    recentFaultByCharger={recentFaultByCharger}
                    onSelectCharger={handleSelectFromOverview}
                    onNavigateChargers={() => goToChargers()}
                    onNavigateUsage={() => changeTab("usage")}
                    onNavigateFaults={() => changeTab("faults")}
                    onNavigateCharging={() => goToChargers(undefined, "charging")}
                    onNavigateStatus={(filter) => goToChargers(undefined, filter)}
                  />
                )}
                {activeTab === "chargers" && (
                  <ChargersTab
                    chargers={data.chargers}
                    sessions={data.sessions}
                    selectedChargerId={selectedChargerId}
                    detail={selectedDetail}
                    onSelect={setSelectedChargerId}
                    onCloseDetail={() => setSelectedChargerId(null)}
                    defaultFilter={chargerFilter}
                  />
                )}
                {activeTab === "usage" && (
                  <UsageTab series={usageSeries} totalChargers={data.chargers.length} />
                )}
                {activeTab === "faults" && (
                  <FaultsTab
                    faults={data.faults}
                    chargers={data.chargers}
                    filters={faultFilters}
                    onFiltersChange={setFaultFilters}
                    onFaultClick={handleFaultClick}
                  />
                )}
              </TabPanel>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function syncUrl({
  scenario,
  tab,
}: {
  scenario: ScenarioId;
  tab: DashboardTab;
}) {
  const url = new URL(window.location.href);
  if (scenario === "default") url.searchParams.delete("scenario");
  else url.searchParams.set("scenario", scenario);
  if (tab === "overview") url.searchParams.delete("tab");
  else url.searchParams.set("tab", tab);
  window.history.replaceState(null, "", url.toString());
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-8 pt-8">
      <div className="panel h-32 animate-pulse" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="panel h-24 animate-pulse" />
        ))}
      </div>
      <div className="panel h-64 animate-pulse" />
    </div>
  );
}
