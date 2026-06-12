import type { LucideIcon } from "lucide-react";
import {
  BatteryCharging,
  CircleCheck,
  TriangleAlert,
  Unplug,
} from "lucide-react";
import type { ChargerStatus } from "@/lib/types";
import { STATUS_META } from "@/lib/constants";

const STATUS_ICONS: Record<ChargerStatus, LucideIcon> = {
  available: CircleCheck,
  charging: BatteryCharging,
  faulted: TriangleAlert,
  offline: Unplug,
};

/**
 * Distinct Lucide icon per charger status — consistent with the icon rail and
 * header controls elsewhere in the app.
 */
export function StatusIcon({
  status,
  size = 14,
  className = "",
  strokeWidth = 2,
}: {
  status: ChargerStatus;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  const Icon = STATUS_ICONS[status];
  const color = STATUS_META[status].color;

  return (
    <Icon
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      style={{ color }}
      aria-hidden="true"
    />
  );
}
