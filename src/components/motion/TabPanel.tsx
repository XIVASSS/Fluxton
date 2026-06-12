"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

interface TabPanelProps {
  tabKey: string;
  children: ReactNode;
}

/** Slide/fade wrapper for tab content switches. */
export function TabPanel({ tabKey, children }: TabPanelProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={tabKey}
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -16 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
