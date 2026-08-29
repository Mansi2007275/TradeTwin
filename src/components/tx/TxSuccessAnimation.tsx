"use client";

import { motion } from "framer-motion";

export function TxSuccessAnimation() {
  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 22, duration: 0.35 }}
      className="neo-raised-sm flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent-soft)]"
    >
      <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden>
        <motion.circle
          cx="18"
          cy="18"
          r="16"
          fill="none"
          stroke="var(--success)"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
        <motion.path
          d="M11 18.5 L16 23.5 L25 13"
          fill="none"
          stroke="var(--success)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.35, delay: 0.15, ease: "easeOut" }}
        />
      </svg>
    </motion.div>
  );
}
