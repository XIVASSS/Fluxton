import type { ReactNode } from "react";

/**
 * Meaningful empty / no-results state. Every view routes to this rather than
 * rendering a blank region, so a manager always understands *why* a panel is
 * empty (no data vs. filtered out).
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  compact = false,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        compact ? "gap-2 py-8" : "gap-3 py-14"
      }`}
    >
      {icon && (
        <span className="mb-1 inline-flex h-11 w-11 items-center justify-center rounded-[12px] border border-[color-mix(in_srgb,var(--color-bone)_10%,transparent)] text-ash">
          {icon}
        </span>
      )}
      <p
        className="text-[16px] font-medium text-bone"
        style={{ fontFamily: "var(--font-geist)" }}
      >
        {title}
      </p>
      {description && (
        <p className="max-w-[34ch] text-[14px] leading-relaxed text-fog">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
