"use client";

interface RadialGaugeProps {
  /** 0–100 */
  percent: number;
  centerPrimary: string;
  centerSecondary?: string;
  accentColor?: string;
}

/**
 * Radial donut gauge with rounded arc caps (strokeLinecap="round").
 */
export function RadialGauge({
  percent,
  centerPrimary,
  centerSecondary,
  accentColor = "var(--color-lavender)",
}: RadialGaugeProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  const size = 220;
  const stroke = 18;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (clamped / 100) * circumference;
  const center = size / 2;

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[220px]">
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
        />
        {/* Progress — rounded ends */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={accentColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${center} ${center})`}
          style={{ transition: "stroke-dashoffset 0.6s ease-out" }}
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <div className="text-center px-2">
          <p
            className="text-[22px] font-semibold leading-tight text-bone sm:text-[24px]"
            style={{ fontFamily: "var(--font-geist)" }}
          >
            {centerPrimary}
          </p>
          {centerSecondary && (
            <p className="mt-0.5 text-[12px] leading-snug text-fog">{centerSecondary}</p>
          )}
        </div>
      </div>
    </div>
  );
}
