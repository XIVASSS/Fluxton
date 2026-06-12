"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { Charger, Session } from "@/lib/types";
import type { ChargerDetail } from "@/lib/selectors";
import type { ChargerStatus } from "@/lib/types";
import { STATUS_PRIORITY } from "@/lib/constants";
import { isLive, sortChargersByPriority } from "@/lib/selectors";
import { ChargerListRow } from "../ChargerListRow";
import { ChargerDetailPanel } from "../ChargerDetailPanel";
import { EmptyState } from "../ui/EmptyState";
import { PlugIcon } from "../ui/icons";

type StatusFilter = "all" | ChargerStatus;

const FILTER_CHIPS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "charging", label: "Charging" },
  { id: "faulted", label: "Faulted" },
  { id: "offline", label: "Offline" },
  { id: "available", label: "Available" },
];

interface ChargersTabProps {
  chargers: Charger[];
  sessions: Session[];
  selectedChargerId: string | null;
  detail: ChargerDetail | null;
  onSelect: (id: string) => void;
  onCloseDetail: () => void;
  defaultFilter?: StatusFilter;
}

/**
 * Chargers tab — filter chips + compact list + embedded detail panel.
 * On mobile, detail opens as a slide-over drawer.
 */
export function ChargersTab({
  chargers,
  sessions,
  selectedChargerId,
  detail,
  onSelect,
  onCloseDetail,
  defaultFilter = "all",
}: ChargersTabProps) {
  const [filter, setFilter] = useState<StatusFilter>(defaultFilter);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setFilter(defaultFilter);
  }, [defaultFilter]);

  const liveByCharger = useMemo(() => {
    const map = new Map<string, Session>();
    for (const s of sessions) {
      if (isLive(s)) map.set(s.chargerId, s);
    }
    return map;
  }, [sessions]);

  const filtered = useMemo(() => {
    const sorted = sortChargersByPriority(chargers, STATUS_PRIORITY);
    if (filter === "all") return sorted;
    return sorted.filter((c) => c.status === filter);
  }, [chargers, filter]);

  const handleSelect = (id: string) => {
    onSelect(id);
    setDrawerOpen(true);
  };

  if (chargers.length === 0) {
    return (
      <div className="panel-rich p-8">
        <EmptyState
          icon={<PlugIcon size={24} />}
          title="No chargers configured"
          description="This depot has no charging units yet. Once hardware is registered they will appear here."
        />
      </div>
    );
  }

  return (
    <>
      {/* Filter chips */}
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTER_CHIPS.map((chip) => {
          const active = filter === chip.id;
          return (
            <motion.button
              key={chip.id}
              type="button"
              onClick={() => setFilter(chip.id)}
              whileTap={{ scale: 0.94 }}
              layout
              className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors duration-300 ${
                active
                  ? "bg-paper text-onyx"
                  : "border border-ink bg-char text-ash hover:text-mist"
              }`}
            >
              {chip.label}
            </motion.button>
          );
        })}
        <span className="ml-auto self-center text-[13px] text-fog">
          {filtered.length} unit{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Desktop: list + detail split */}
      <div className="panel-rich hidden overflow-hidden lg:grid lg:grid-cols-5 lg:min-h-[520px]">
        <div className="col-span-2 max-h-[560px] overflow-y-auto border-r border-ink">
          {filtered.length === 0 ? (
            <p className="px-4 py-8 text-center text-[14px] text-fog">
              No chargers match this filter.
            </p>
          ) : (
            filtered.map((c) => (
              <ChargerListRow
                key={c.id}
                charger={c}
                liveSession={liveByCharger.get(c.id)}
                selected={c.id === selectedChargerId}
                onSelect={handleSelect}
              />
            ))
          )}
        </div>
        <div className="col-span-3 overflow-y-auto">
          <ChargerDetailPanel detail={detail} onClose={onCloseDetail} embedded />
        </div>
      </div>

      {/* Mobile: list only; detail in drawer */}
      <div className="panel-rich overflow-hidden lg:hidden">
        <div className="max-h-[480px] overflow-y-auto">
          {filtered.map((c) => (
            <ChargerListRow
              key={c.id}
              charger={c}
              liveSession={liveByCharger.get(c.id)}
              selected={c.id === selectedChargerId}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && selectedChargerId && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close detail"
            className="absolute inset-0 bg-onyx/60"
            onClick={() => {
              setDrawerOpen(false);
              onCloseDetail();
            }}
          />
          <div className="absolute inset-y-0 right-0 w-full max-w-md overflow-y-auto bg-char shadow-2xl">
            <div className="sticky top-0 z-10 flex justify-end border-b border-ink bg-char p-2">
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  onCloseDetail();
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full text-ash hover:text-bone"
              >
                <X size={20} />
              </button>
            </div>
            <ChargerDetailPanel detail={detail} onClose={onCloseDetail} embedded />
          </div>
        </div>
      )}
    </>
  );
}
