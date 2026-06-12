"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  LayoutGrid,
  LogOut,
  Plug,
  TriangleAlert,
} from "lucide-react";
import type { DashboardTab } from "@/lib/dashboard-tabs";

interface IconRailProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  faultCount: number;
}

const RAIL_ITEMS: {
  id: DashboardTab;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  label: string;
}[] = [
  { id: "overview", icon: LayoutGrid, label: "Overview" },
  { id: "chargers", icon: Plug, label: "Chargers" },
  { id: "usage", icon: BarChart3, label: "Usage" },
  { id: "faults", icon: TriangleAlert, label: "Faults" },
];

/** Borderless icon rail — icons only, shares dawn-glow canvas with main. */
export function IconRail({ activeTab, onTabChange, faultCount }: IconRailProps) {
  return (
    <aside className="seamless-rail fixed inset-y-0 left-0 z-20 hidden w-[72px] flex-col items-center py-8 lg:flex">
      <nav className="flex flex-1 flex-col items-center justify-center gap-3">
        {RAIL_ITEMS.map(({ id, icon: Icon, label }) => {
          const active = activeTab === id;
          const showBadge = id === "faults" && faultCount > 0;
          return (
            <motion.button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              title={label}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.9 }}
              className="group relative flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(255,255,255,0.04)] backdrop-blur-sm"
            >
              {active && (
                <motion.span
                  layoutId="rail-active"
                  className="absolute inset-0 rounded-full bg-paper shadow-[0_4px_20px_rgba(255,255,255,0.12)]"
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                />
              )}
              <span
                className={`relative z-10 ${
                  active ? "text-onyx" : "text-ash group-hover:text-mist"
                }`}
              >
                <Icon size={19} strokeWidth={1.9} />
              </span>
              {showBadge && (
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute right-0.5 top-0.5 z-20 h-2 w-2 rounded-full ring-2 ring-void"
                  style={{ backgroundColor: "var(--color-status-faulted)" }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col items-center gap-3">
        <motion.button
          type="button"
          title="Avery Morgan"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-[11px] font-bold text-paper"
          style={{
            background: "linear-gradient(135deg, #ff6b4a, #ff9b8a)",
            boxShadow: "0 0 0 2px rgba(12,12,14,0.8), 0 0 0 4px rgba(255,107,74,0.35)",
          }}
        >
          AM
        </motion.button>
        <motion.button
          type="button"
          aria-label="Logout"
          title="Logout"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(255,255,255,0.05)] text-fog backdrop-blur-sm hover:text-mist"
        >
          <LogOut size={17} strokeWidth={1.8} />
        </motion.button>
      </div>
    </aside>
  );
}
