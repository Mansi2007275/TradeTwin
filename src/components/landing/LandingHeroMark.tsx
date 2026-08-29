"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function LandingHeroMark() {
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-white shadow-sm">
        <Image
          src="/tradetwin-logo.svg"
          alt="TradeTwin"
          width={56}
          height={56}
          priority
          className="select-none"
        />
      </div>
    </motion.div>
  );
}
