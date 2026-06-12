"use client";

import { Plane } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedCard } from "../motion/AnimatedCard";

interface PipelineLeg {
  id: string;
  from: string;
  to: string;
  status: "complete" | "active" | "pending";
}

interface SessionPipelineProps {
  legs: PipelineLeg[];
  onLegClick?: (legId: string) => void;
}

/** Horizontal leg-by-leg progress with clickable legs. */
export function SessionPipeline({ legs, onLegClick }: SessionPipelineProps) {
  return (
    <AnimatedCard index={7} className="panel-rich p-6 sm:p-7">
      <p
        className="mb-5 text-[12px] font-semibold uppercase tracking-[0.1em] text-fog"
        style={{ fontFamily: "var(--font-dm-sans)" }}
      >
        Session pipeline
      </p>
      <div className="grid gap-6 sm:grid-cols-3">
        {legs.map((leg) => (
          <motion.button
            key={leg.id}
            type="button"
            onClick={() => onLegClick?.(leg.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative min-w-0 rounded-2xl border border-transparent p-3 text-left transition-colors duration-300 hover:border-ink hover:bg-iron"
          >
            <p
              className="mb-3 text-[13px] font-medium text-mist"
              style={{ fontFamily: "var(--font-geist)" }}
            >
              {leg.id}
            </p>
            <div className="flex items-center gap-2">
              <span className="truncate text-[14px] font-medium text-bone">{leg.from}</span>
              <LegConnector status={leg.status} />
              <span className="truncate text-[14px] font-medium text-bone">{leg.to}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </AnimatedCard>
  );
}

function LegConnector({ status }: { status: PipelineLeg["status"] }) {
  if (status === "complete") {
    return (
      <span className="relative mx-1 flex min-w-[48px] flex-1 items-center">
        <span className="h-[2px] w-full rounded-full bg-[var(--color-lime)]" />
        <span className="absolute right-0 h-2 w-2 rounded-full bg-[var(--color-lime)]" />
      </span>
    );
  }

  if (status === "active") {
    return (
      <span className="relative mx-1 flex min-w-[48px] flex-1 items-center justify-center">
        <span className="h-[2px] w-full rounded-full border-t-2 border-dashed border-lavender opacity-70" />
        <motion.span
          animate={{ x: [0, 4, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute right-0 flex h-8 w-8 items-center justify-center rounded-full node-pulse"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--color-lavender) 50%, transparent), transparent 70%)",
          }}
        >
          <Plane size={14} className="text-lavender" style={{ transform: "rotate(45deg)" }} />
        </motion.span>
      </span>
    );
  }

  return (
    <span className="mx-1 h-[2px] min-w-[48px] flex-1 rounded-full bg-[rgba(255,255,255,0.08)]" />
  );
}
