import type { ChargerStatus } from "@/lib/types";
import { STATUS_META } from "@/lib/constants";
import {
  AlertTriangleIcon,
  BoltIcon,
  PlugIcon,
  PowerOffIcon,
} from "./icons";

/**
 * Distinct icon per charger status — used alongside color in the overview so
 * status is readable without relying on text labels alone.
 */
export function StatusIcon({
  status,
  size = 14,
  className = "",
}: {
  status: ChargerStatus;
  size?: number;
  className?: string;
}) {
  const color = STATUS_META[status].color;
  const props = { size, className, style: { color } };

  switch (status) {
    case "available":
      return <PlugIcon {...props} />;
    case "charging":
      return <BoltIcon {...props} />;
    case "faulted":
      return <AlertTriangleIcon {...props} />;
    case "offline":
      return <PowerOffIcon {...props} />;
  }
}
