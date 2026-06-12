import type { HTMLAttributes } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds standard 24px card padding when true (default). */
  padded?: boolean;
}

/**
 * Signature Dimension surface: translucent #1d1d1d over the dawn glow, blurred,
 * with a hairline border and 24px radius. Depth comes from translucency, not
 * shadow stacks.
 */
export function GlassCard({
  padded = true,
  className = "",
  children,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={`glass rounded-[24px] ${padded ? "p-6" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

/** Small uppercase section label in the muted register. */
export function SectionLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`text-[12px] font-medium uppercase tracking-[0.12em] text-fog ${className}`}
      style={{ fontFamily: "var(--font-dm-sans)" }}
    >
      {children}
    </span>
  );
}
