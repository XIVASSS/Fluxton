"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValueEvent } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  decimals?: number;
  className?: string;
  style?: React.CSSProperties;
}

/** Count-up animation for stats and percentages. */
export function AnimatedCounter({
  value,
  suffix = "",
  decimals = 0,
  className = "",
  style,
}: AnimatedCounterProps) {
  const spring = useSpring(0, { stiffness: 60, damping: 18 });
  const [text, setText] = useState(`0${suffix}`);

  useMotionValueEvent(spring, "change", (v) => {
    const n = decimals > 0 ? v.toFixed(decimals) : Math.round(v).toString();
    setText(`${n}${suffix}`);
  });

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return (
    <motion.span className={className} style={style}>
      {text}
    </motion.span>
  );
}
