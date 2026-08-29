"use client";

import Link from "next/link";
import type { DNAScoreResult } from "@/lib/dna/types";
import { cn } from "@/lib/utils";

interface DNAGlanceCardProps {
  scores: DNAScoreResult[] | null | undefined;
  className?: string;
}

export function DNAGlanceCard({ scores, className }: DNAGlanceCardProps) {
  const hasScores = (scores?.length ?? 0) > 0;

  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--border-subtle)] bg-white p-6 shadow-sm",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="type-eyebrow">Trading DNA</p>
          <h3 className="mt-1 text-lg font-semibold text-[var(--text-display)]">At a glance</h3>
        </div>
        <Link
          href="/dna"
          className="text-sm font-medium text-[var(--accent)] hover:underline"
        >
          View full DNA →
        </Link>
      </div>

      {!hasScores ? (
        <div className="mt-6 rounded-lg border border-dashed border-[var(--border-subtle)] bg-[var(--surface-inset)] p-8 text-center text-sm text-[var(--text-muted)]">
          Run analysis to see your behavioural scores
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {scores!.map((score) => (
            <div key={score.id}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-[var(--text-heading)]">
                  {score.label.replace(" Score", "")}
                </span>
                <span className="font-data font-medium text-[var(--text-muted)]">
                  {Math.round(score.score)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                <div
                  className="h-full rounded-full bg-[var(--accent)]"
                  style={{ width: `${Math.min(100, Math.max(0, score.score))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
