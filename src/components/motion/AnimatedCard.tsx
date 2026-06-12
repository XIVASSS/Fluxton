"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface AnimatedCardProps {
  children: ReactNode;
  index?: number;
  asButton?: boolean;
  glow?: boolean;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const entrance = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: "easeOut" as const },
  }),
};

const motionProps = {
  whileHover: { y: -4, scale: 1.01, transition: { duration: 0.25 } },
  whileTap: { scale: 0.98 },
};

/** Interactive card with entrance, hover lift, and tap feedback. */
export function AnimatedCard({
  children,
  index = 0,
  asButton = false,
  glow = true,
  className = "",
  onClick,
  style,
}: AnimatedCardProps) {
  const cls = `card-interactive ${glow ? "card-interactive-glow" : ""} ${className}`;

  if (asButton) {
    return (
      <motion.button
        type="button"
        onClick={onClick}
        custom={index}
        initial="hidden"
        animate="visible"
        variants={entrance}
        {...motionProps}
        className={cls}
        style={style}
      >
        {children}
      </motion.button>
    );
  }

  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={entrance}
      {...motionProps}
      className={cls}
      style={style}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
