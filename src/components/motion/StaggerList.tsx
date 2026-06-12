"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface StaggerListProps {
  children: ReactNode;
  className?: string;
}

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.08 },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
};

/** Stagger children entrance — use with motion.li / motion.tr variants={staggerItem}. */
export function StaggerList({ children, className = "" }: StaggerListProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={container}
    >
      {children}
    </motion.div>
  );
}
