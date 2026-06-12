"use client";

import { motion } from "framer-motion";

const NODES = [
  { label: "A1", x: 80, y: 180, done: true },
  { label: "B2", x: 280, y: 200, done: true },
  { label: "C3", x: 400, y: 120, active: true },
  { label: "D4", x: 580, y: 70 },
  { label: "E5", x: 720, y: 100 },
] as const;

interface DepotNetworkTrackProps {
  onNodeClick?: (label: string) => void;
}

/** Dot-grid network map with animated path and clickable nodes. */
export function DepotNetworkTrack({ onNodeClick }: DepotNetworkTrackProps) {
  return (
    <div className="relative h-[220px] w-full overflow-hidden rounded-[28px] bg-[rgba(0,0,0,0.35)] sm:h-[260px]">
      <svg className="absolute inset-0 h-full w-full opacity-40" aria-hidden>
        <defs>
          <pattern id="depot-dots" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.15)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#depot-dots)" />
      </svg>

      <svg
        viewBox="0 0 800 260"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        aria-label="Depot network map"
      >
        <defs>
          <linearGradient id="route-glow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-lime)" stopOpacity="0.9" />
            <stop offset="55%" stopColor="var(--color-lavender)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="var(--color-lavender)" stopOpacity="0.6" />
          </linearGradient>
          <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          d="M 80 180 C 180 80, 280 220, 400 120 S 620 40, 720 100"
          fill="none"
          stroke="url(#route-glow)"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.85"
          className="route-path-draw"
        />

        {NODES.map((node) => (
          <Node key={node.label} {...node} onClick={() => onNodeClick?.(node.label)} />
        ))}
      </svg>
    </div>
  );
}

function Node({
  x,
  y,
  label,
  done,
  active,
  onClick,
}: {
  x: number;
  y: number;
  label: string;
  done?: boolean;
  active?: boolean;
  onClick?: () => void;
}) {
  const fill = done
    ? "var(--color-lime)"
    : active
      ? "var(--color-lavender)"
      : "rgba(255,255,255,0.2)";
  const textFill = done || active ? "#0c0c0e" : "#ffffff";

  return (
    <g
      filter={active ? "url(#node-glow)" : undefined}
      onClick={onClick}
      className={onClick ? "cursor-pointer" : undefined}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <motion.circle
        cx={x}
        cy={y}
        r={active ? 22 : 18}
        fill={fill}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.92 }}
        className={active ? "node-pulse" : undefined}
      />
      <text
        x={x}
        y={y + 5}
        textAnchor="middle"
        fontSize={active ? 11 : 10}
        fontWeight="700"
        fill={textFill}
        style={{ fontFamily: "var(--font-geist)", pointerEvents: "none" }}
      >
        {label}
      </text>
      {active && (
        <circle
          cx={x}
          cy={y}
          r={28}
          fill="none"
          stroke="var(--color-lavender)"
          strokeWidth="2"
          opacity="0.45"
          style={{ pointerEvents: "none" }}
        />
      )}
    </g>
  );
}
