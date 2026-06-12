"use client";

import type { UsageDay } from "@/lib/selectors";
import { UsageChart } from "../UsageChart";
import { AnimatedCard } from "../motion/AnimatedCard";
import { EmptyState } from "../ui/EmptyState";
import { PlugIcon } from "../ui/icons";

interface UsageTabProps {
  series: UsageDay[];
  totalChargers: number;
}

export function UsageTab({ series, totalChargers }: UsageTabProps) {
  if (totalChargers === 0) {
    return (
      <AnimatedCard index={0} className="panel-rich p-8">
        <EmptyState
          icon={<PlugIcon size={24} />}
          title="No usage data"
          description="This depot has no chargers configured, so there is no session or energy history to chart."
        />
      </AnimatedCard>
    );
  }

  return (
    <AnimatedCard index={0} className="panel-rich overflow-hidden p-1">
      <UsageChart series={series} />
    </AnimatedCard>
  );
}
