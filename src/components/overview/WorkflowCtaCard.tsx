"use client";

import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedCard } from "../motion/AnimatedCard";

interface WorkflowCtaCardProps {
  onClick?: () => void;
}

/** Lime gradient CTA card — Mytasky "Optimize Workflow" pattern. */
export function WorkflowCtaCard({ onClick }: WorkflowCtaCardProps) {
  return (
    <AnimatedCard
      asButton
      index={5}
      onClick={onClick}
      className="relative flex min-h-[280px] flex-col overflow-hidden rounded-[28px] p-6 text-left sm:p-7"
      style={{
        background:
          "linear-gradient(165deg, var(--color-lime) 0%, color-mix(in srgb, var(--color-lime) 70%, #8ab820) 55%, #5a8010 100%)",
      }}
    >
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p
            className="text-[12px] font-bold uppercase tracking-[0.12em] text-onyx/70"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Optimize fleet
          </p>
          <p
            className="mt-2 max-w-[200px] text-[22px] font-bold leading-tight text-onyx"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Balance load across bays
          </p>
        </div>
        <motion.span whileHover={{ x: 4 }} className="flex h-9 w-9 items-center justify-center rounded-full bg-onyx/15">
          <ChevronRight size={18} className="text-onyx" />
        </motion.span>
      </div>
      <div className="relative z-10 mt-auto pt-8">
        <span
          className="inline-flex rounded-full bg-onyx px-5 py-2.5 text-[13px] font-bold text-lime transition-all duration-300 hover:brightness-125"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          SET UP
        </span>
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 opacity-40"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.35), transparent)",
        }}
      />
    </AnimatedCard>
  );
}
