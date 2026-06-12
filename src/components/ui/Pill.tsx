"use client";

import type { ButtonHTMLAttributes } from "react";

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
