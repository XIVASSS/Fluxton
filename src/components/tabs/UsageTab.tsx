"use client";

import type { UsageDay } from "@/lib/selectors";
import { UsageChart } from "../UsageChart";
import { AnimatedCard } from "../motion/AnimatedCard";

interface UsageTabProps {
  series: UsageDay[];
}

export function UsageTab({ series }: UsageTabProps) {
  return (
    <AnimatedCard index={0} className="panel-rich overflow-hidden p-1">
      <UsageChart series={series} />
    </AnimatedCard>
  );
}
