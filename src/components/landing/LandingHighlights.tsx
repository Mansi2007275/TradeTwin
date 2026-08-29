"use client";

import { motion } from "framer-motion";

const highlights = [
  "AI Behavioral Twin",
  "Risk-Free Simulation",
  "On-Chain Proof",
] as const;

export function LandingHighlights() {
  return (
    <motion.div
      className="mt-8 flex flex-wrap items-center justify-center gap-2"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.06, delayChildren: 0.5 } },
      }}
    >
      {highlights.map((label) => (
        <motion.span
          key={label}
          variants={{
            hidden: { opacity: 0, y: 8 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
          }}
          className="rounded-full border border-[var(--border-subtle)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--text-muted)]"
        >
          {label}
        </motion.span>
      ))}
    </motion.div>
  );
}
