"use client";

import { motion } from "framer-motion";
import { ConfettiBurst } from "@/components/results/ConfettiBurst";
import type { SimulationOutcome } from "@/lib/simulation/types";

interface WinRevealProps {
  outcome: SimulationOutcome;
}

export function WinReveal({ outcome }: WinRevealProps) {
  const { winner, userReturn, twinReturn } = outcome;

  const winnerLabel =
    winner === "user" ? "You Win" : winner === "twin" ? "Twin Wins" : "It's a Tie";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="relative mb-6 overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-white p-8 text-center shadow-sm"
    >
      <ConfettiBurst active={winner === "user"} />

      <p className="text-2xl font-semibold text-[var(--text-display)]">{winnerLabel}</p>

      <p className="mt-3 text-sm text-[var(--text-muted)]">
        {winner === "user"
          ? "You beat your Trading Twin in this replay."
          : winner === "twin"
            ? "Your Twin outperformed you."
            : "Evenly matched — try again."}
      </p>

      <div className="mt-6 flex justify-center gap-6">
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-inset)] px-5 py-3">
          <p className="text-xs text-[var(--text-muted)]">Your Return</p>
          <p className="font-data text-xl font-semibold">{userReturn.toFixed(2)}%</p>
        </div>
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-inset)] px-5 py-3">
          <p className="text-xs text-[var(--text-muted)]">Twin Return</p>
          <p className="font-data text-xl font-semibold">{twinReturn.toFixed(2)}%</p>
        </div>
      </div>
    </motion.div>
  );
}
