"use client";

import type { ReactNode } from "react";

interface AsymmetricalWidgetProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * High-contrast white card with stepped top-right corner — Mytasky "Tasks List" pattern.
 */
export function AsymmetricalWidget({
  title,
  subtitle,
  action,
  children,
  className = "",
}: AsymmetricalWidgetProps) {
  return (
    <div className={`widget-white flex flex-col ${className}`}>
      <div className="flex items-start justify-between gap-3 border-b border-dotted border-[rgba(12,12,14,0.12)] px-6 py-5 sm:px-7">
        <div>
          <h2
            className="text-[18px] font-semibold tracking-[-0.02em] text-[var(--color-surface-elevated-text)]"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-[13px] text-[var(--color-surface-elevated-muted)]">
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}
