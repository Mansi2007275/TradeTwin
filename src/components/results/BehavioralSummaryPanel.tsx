"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader } from "@/components/ui/Card";
import { MotionItem } from "@/components/motion/MotionStagger";
import type { TradingDNA } from "@/lib/dna/types";
import type { RoundRecord } from "@/lib/simulation/types";
import { buildBehavioralSessionSummary } from "@/lib/simulation/why-we-differed";
import { cn } from "@/lib/utils";

interface BehavioralSummaryPanelProps {
  rounds: RoundRecord[];
  dna: TradingDNA;
}

export function BehavioralSummaryPanel({ rounds, dna }: BehavioralSummaryPanelProps) {
  const summary = useMemo(
    () => buildBehavioralSessionSummary(rounds, dna),
    [rounds, dna],
  );

  if (summary.totalRounds === 0) return null;

  return (
    <MotionItem>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <Card padding="lg" hover={false}>
          <CardHeader
            eyebrow="Behavioral summary"
            title="How you matched your own history"
            subtitle="Across all rounds in this simulation session"
          />

          <p className="mt-4 text-base font-medium leading-relaxed text-[var(--text-display)]">
            {summary.headline}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <StatPill
              label="Matched pattern"
              value={summary.matchedPatternRounds}
              total={summary.totalRounds}
              tone="success"
            />
            <StatPill
              label="Broke pattern"
              value={summary.brokePatternRounds}
              total={summary.totalRounds}
              tone="warning"
            />
            <StatPill
              label="Same decision"
              value={summary.alignedRounds}
              total={summary.totalRounds}
              tone="neutral"
            />
          </div>

          <ul className="mt-6 space-y-2">
            {summary.detailLines.map((line) => (
              <li
                key={line}
                className="flex gap-2 text-sm leading-relaxed text-[var(--text-muted)]"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                {line}
              </li>
            ))}
          </ul>
        </Card>
      </motion.div>
    </MotionItem>
  );
}

function StatPill({
  label,
  value,
  total,
  tone,
}: {
  label: string;
  value: number;
  total: number;
  tone: "success" | "warning" | "neutral";
}) {
  const toneClass =
    tone === "success"
      ? "text-[var(--success)]"
      : tone === "warning"
        ? "text-[var(--warning)]"
        : "text-[var(--text-display)]";

  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-inset)] px-4 py-3 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-faint)]">
        {label}
      </p>
      <p className={cn("font-data mt-1 text-2xl font-bold tabular-nums", toneClass)}>
        {value}
        <span className="text-sm font-normal text-[var(--text-faint)]"> / {total}</span>
      </p>
    </div>
  );
}
