/** Presentation helpers. Pure, side-effect free, locale-stable. */

export function formatKwh(value: number): string {
  return `${value.toLocaleString("en-US", {
    minimumFractionDigits: value < 100 ? 1 : 0,
    maximumFractionDigits: 1,
  })} kWh`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
}

/** e.g. "13 Jun, 14:32" */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Compact relative age, e.g. "3m ago", "5h ago", "2d ago". */
export function formatRelative(iso: string, now: number = Date.now()): string {
  const diffMs = now - new Date(iso).getTime();
  const sec = Math.max(0, Math.round(diffMs / 1000));
  if (sec < 60) return `${sec}s ago`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  return `${day}d ago`;
}

/** Duration in ms -> "1h 24m" / "47m" / "38s". */
export function formatDuration(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
}
