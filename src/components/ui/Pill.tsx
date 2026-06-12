"use client";

import type { ButtonHTMLAttributes } from "react";

/**
 * Pill-shaped control (9999px radius), the default interactive form in
 * Dimension. `variant="primary"` is the lone filled white CTA; everything else
 * is monochrome glass.
 */
interface PillButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "active";
}

export function PillButton({
  variant = "ghost",
  className = "",
  children,
  ...props
}: PillButtonProps) {
  const styles: Record<string, string> = {
    primary: "bg-paper text-void hover:bg-bone",
    ghost:
      "border border-[color-mix(in_srgb,var(--color-bone)_12%,transparent)] text-mist hover:text-bone hover:border-[color-mix(in_srgb,var(--color-bone)_22%,transparent)]",
    active:
      "border border-[color-mix(in_srgb,var(--color-bone)_22%,transparent)] bg-[color-mix(in_srgb,var(--color-bone)_10%,transparent)] text-bone",
  };
  return (
    <button
      className={`inline-flex h-9 items-center gap-2 rounded-[9999px] px-4 text-[14px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${styles[variant]} ${className}`}
      style={{ fontFamily: "var(--font-dm-sans)" }}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Segmented pill control — a row of options where one is active. Used for the
 * time-range filter.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
  ariaLabel?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="inline-flex items-center gap-1 rounded-[9999px] border border-[color-mix(in_srgb,var(--color-bone)_10%,transparent)] bg-[color-mix(in_srgb,var(--color-void)_60%,transparent)] p-1"
    >
      {options.map((opt) => {
        const isActive = opt.id === value;
        return (
          <button
            key={opt.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(opt.id)}
            className={`h-7 rounded-[9999px] px-3 text-[13px] font-medium transition-colors ${
              isActive
                ? "bg-[color-mix(in_srgb,var(--color-bone)_14%,transparent)] text-bone"
                : "text-fog hover:text-mist"
            }`}
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
