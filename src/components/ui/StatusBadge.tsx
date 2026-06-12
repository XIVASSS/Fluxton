import type { ChargerStatus } from "@/lib/types";
import { STATUS_META } from "@/lib/constants";
import {
  AlertTriangleIcon,
  BoltIcon,
  PlugIcon,
  PowerOffIcon,
} from "./icons";

const STATUS_ICON: Record<
  ChargerStatus,
  (props: { size?: number }) => React.ReactNode
> = {
  available: PlugIcon,
  charging: BoltIcon,
  faulted: AlertTriangleIcon,
  offline: PowerOffIcon,
};

/** The status icon alone (color carried by `currentColor`). */
export function StatusIcon({
  status,
  size = 16,
}: {
  status: ChargerStatus;
  size?: number;
}) {
  const Icon = STATUS_ICON[status];
  return (
    <span style={{ color: STATUS_META[status].color }} className="inline-flex">
      <Icon size={size} />
    </span>
  );
}

/**
 * Pill badge combining a status dot, icon, and label. Color + icon both encode
 * status so it never relies on the text label alone.
 */
export function StatusBadge({
  status,
  size = "md",
}: {
  status: ChargerStatus;
  size?: "sm" | "md";
}) {
  const meta = STATUS_META[status];
  const isSm = size === "sm";
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-[9999px] border ${
        isSm ? "px-2.5 py-1 text-[12px]" : "px-3 py-1.5 text-[13px]"
      } font-medium`}
      style={{
        color: meta.color,
        borderColor: `color-mix(in srgb, ${meta.color} 35%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${meta.color} 12%, transparent)`,
        fontFamily: "var(--font-dm-sans)",
      }}
    >
      <StatusDot status={status} pulse={status === "charging"} />
      {meta.label}
    </span>
  );
}

/** A small status dot; charging gently pulses to read as "live". */
export function StatusDot({
  status,
  pulse = false,
  size = 8,
}: {
  status: ChargerStatus;
  pulse?: boolean;
  size?: number;
}) {
  const meta = STATUS_META[status];
  return (
    <span
      className="relative inline-flex shrink-0"
      style={{ width: size, height: size }}
    >
      {pulse && (
        <span
          className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
          style={{ backgroundColor: meta.color }}
        />
      )}
      <span
        className="relative inline-flex rounded-full"
        style={{ width: size, height: size, backgroundColor: meta.color }}
      />
    </span>
  );
}
