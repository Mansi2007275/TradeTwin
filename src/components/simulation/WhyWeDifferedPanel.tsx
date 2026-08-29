"use client";

import { motion } from "framer-motion";
import { Card, CardHeader } from "@/components/ui/Card";
import { SectionEyebrow } from "@/components/ui/StatusIndicators";
import type { WhyWeDifferedExplanation } from "@/lib/simulation/why-we-differed";
import { cn } from "@/lib/utils";

interface WhyWeDifferedPanelProps {
  explanation: WhyWeDifferedExplanation;
  className?: string;
}

export function WhyWeDifferedPanel({ explanation, className }: WhyWeDifferedPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      <Card
        variant="hero"
        padding="lg"
        hover={false}
        className="border-[var(--border-strong)] bg-gradient-to-br from-white to-[var(--surface-inset)]"
      >
        <CardHeader
          eyebrow="Why we differed"
          title="Your instinct vs your history"
          subtitle={`Round ${explanation.roundId} — decisions diverged`}
        />

        <div className="mt-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-[var(--border-subtle)] bg-white p-4">
              <SectionEyebrow>Your move</SectionEyebrow>
              <p className="mt-2 font-data text-2xl font-bold tracking-tight text-[var(--text-display)]">
                {explanation.userDecision}
              </p>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                {explanation.userActionLine}
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-inset)] p-4">
              <SectionEyebrow>Your Twin&apos;s move</SectionEyebrow>
              <p
                className={cn(
                  "mt-2 font-data text-2xl font-bold tracking-tight",
                  explanation.twinDecision === "BUY" && "text-[var(--success)]",
                  explanation.twinDecision === "SELL" && "text-[var(--error)]",
                  explanation.twinDecision === "HOLD" && "text-[var(--text-display)]",
                )}
              >
                {explanation.twinDecision}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-heading)]">
                {explanation.twinActionLine}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--warning)]/30 bg-[var(--brutal-coral)]/40 px-5 py-4">
            <p className="text-sm font-semibold text-[var(--text-display)]">
              {explanation.patternLine}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">
              Pattern signal:{" "}
              <span className="font-medium text-[var(--text-heading)]">
                {explanation.dominantPatternLabel}
              </span>
            </p>
          </div>

          <div className="space-y-2 border-t border-[var(--border-subtle)] pt-4">
            <SectionEyebrow>Evidence from your DNA</SectionEyebrow>
            <p className="text-sm leading-relaxed text-[var(--text-heading)]">
              {explanation.evidenceSnippet}
            </p>
            <p className="text-xs leading-relaxed text-[var(--text-muted)]">
              Twin rationale: {explanation.twinRationale}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
