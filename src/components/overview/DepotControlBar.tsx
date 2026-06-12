"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AnimatedCard } from "../motion/AnimatedCard";

interface DepotControlBarProps {
  currentLabel: string;
  totalLabel: string;
  percent: number;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  onPercentChange?: (percent: number) => void;
}

/** Bottom control bar with draggable energy slider. */
export function DepotControlBar({
  currentLabel,
  totalLabel,
  percent,
  onPrimaryAction,
  onSecondaryAction,
  onPercentChange,
}: DepotControlBarProps) {
  const [localPercent, setLocalPercent] = useState(percent);
  const display = onPercentChange ? localPercent : percent;
  const clamped = Math.min(100, Math.max(0, display));

  useEffect(() => {
    setLocalPercent(percent);
  }, [percent]);

  const handleChange = (v: number) => {
    setLocalPercent(v);
    onPercentChange?.(v);
  };

  return (
    <AnimatedCard index={8} className="panel-rich flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:gap-8 sm:p-6">
      <div className="shrink-0 sm:min-w-[200px]">
        <p className="text-[12px] uppercase tracking-[0.08em] text-fog">Energy today</p>
        <p className="mt-1 text-[15px] text-mist">
          <span
            className="text-[20px] font-semibold text-[var(--color-lime)]"
            style={{ fontFamily: "var(--font-geist)" }}
          >
            {currentLabel}
          </span>
          <span className="text-fog"> / {totalLabel}</span>
        </p>
      </div>

      <div className="relative min-w-0 flex-1 px-1">
        <div className="relative h-10">
          <div className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between px-2">
            {Array.from({ length: 24 }).map((_, i) => (
              <span
                key={i}
                className="w-px bg-[rgba(255,255,255,0.12)]"
                style={{ height: i % 6 === 0 ? 12 : 6 }}
              />
            ))}
          </div>
          <div className="pointer-events-none absolute inset-x-2 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-[rgba(255,255,255,0.08)]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[var(--color-lime)] to-[var(--color-lavender)]"
              animate={{ width: `${clamped}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>
          <motion.div
            className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-paper shadow-[0_0_12px_rgba(255,255,255,0.4)]"
            animate={{ left: `calc(${clamped}% - 8px)` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
          <input
            type="range"
            min={0}
            max={100}
            value={clamped}
            onChange={(e) => handleChange(Number(e.target.value))}
            aria-label="Energy progress"
            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
          />
        </div>
      </div>

      <div className="flex shrink-0 gap-3">
        <motion.button
          type="button"
          onClick={onPrimaryAction}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="rounded-full bg-lavender px-5 py-2.5 text-[13px] font-semibold text-paper"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          View chargers
        </motion.button>
        <motion.button
          type="button"
          onClick={onSecondaryAction}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="rounded-full border border-[rgba(255,255,255,0.2)] px-5 py-2.5 text-[13px] font-medium text-bone hover:bg-[rgba(255,255,255,0.04)]"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          View usage
        </motion.button>
      </div>
    </AnimatedCard>
  );
}
