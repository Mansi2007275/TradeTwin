"use client";

import { useState } from "react";
import type { WhatIfAnalysis, RoundCounterfactual, CounterfactualAlternative } from "@/lib/simulation/counterfactual";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { MotionItem } from "@/components/motion/MotionStagger";
import { cn, formatCurrency } from "@/lib/utils";

function AlternativeRow({
  alt,
  isActual,
}: {
  alt: CounterfactualAlternative;
  isActual: boolean;
}) {
  const diffPositive = alt.diffFromActualFinal > 0;

  return (
    <tr
      className={cn(
        "text-[var(--text-heading)]",
        isActual && "bg-[var(--accent-soft)]",
      )}
    >
      <td className="py-2 pr-3 text-xs font-medium">
        {alt.label}
        {isActual && (
          <Badge variant="info" className="ml-2">
            Actual
          </Badge>
        )}
      </td>
      <td className="py-2 pr-3 tabular-nums text-xs">
        {formatCurrency(alt.roundValueAfter)}
      </td>
      <td className="py-2 pr-3 tabular-nums text-xs">
        <span className={alt.roundPnL >= 0 ? "text-[var(--success)]" : "text-[var(--error)]"}>
          {formatCurrency(alt.roundPnL)}
        </span>
      </td>
      <td className="py-2 pr-3 tabular-nums text-xs">
        {!isActual && (
          <span className={diffPositive ? "text-[var(--success)]" : "text-[var(--error)]"}>
            {alt.diffFromActualFinal >= 0 ? "+" : ""}
            {formatCurrency(alt.diffFromActualFinal)}
          </span>
        )}
        {isActual && <span className="text-[var(--text-muted)]">—</span>}
      </td>
      <td className="py-2 tabular-nums text-xs text-[var(--text-muted)]">
        {alt.maxDrawdownPct !== null ? `${alt.maxDrawdownPct.toFixed(1)}%` : "—"}
      </td>
    </tr>
  );
}

function RoundWhatIfCard({ round }: { round: RoundCounterfactual }) {
  const [expanded, setExpanded] = useState(false);

  const actualAlt: CounterfactualAlternative = {
    label: `Actual (${round.actualDecision})`,
    variant: round.actualDecision,
    decision: round.actualDecision,
    roundValueAfter: round.portfolioBefore + round.actualRoundPnL,
    roundPnL: round.actualRoundPnL,
    diffFromActualRound: 0,
    finalPortfolioValue: round.actualFinalValue,
    finalReturnPct: 0,
    diffFromActualFinal: 0,
    maxDrawdownPct: null,
  };

  return (
    <MotionItem>
      <Card padding="sm">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-between text-left"
        >
          <div>
            <p className="text-sm font-medium text-[var(--text-heading)]">
              Round {round.roundId} — Actual:{" "}
              <span className="text-[var(--accent)]">{round.actualDecision}</span>
            </p>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              ETH @ {formatCurrency(round.marketPrice)} · Round PnL{" "}
              {formatCurrency(round.actualRoundPnL)}
            </p>
          </div>
          <span className="text-xs text-[var(--accent)]">{expanded ? "Hide" : "Compare"}</span>
        </button>

        {expanded && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                  <th className="pb-2 pr-3">Scenario</th>
                  <th className="pb-2 pr-3">Round Value</th>
                  <th className="pb-2 pr-3">Round PnL</th>
                  <th className="pb-2 pr-3">Δ vs Actual (Final)</th>
                  <th className="pb-2">Max Drawdown</th>
                </tr>
              </thead>
              <tbody>
                <AlternativeRow
                  alt={{
                    ...actualAlt,
                    finalReturnPct:
                      ((round.actualFinalValue - 10_000) / 10_000) * 100,
                  }}
                  isActual
                />
                {round.alternatives
                  .filter((a) => a.variant !== round.actualDecision)
                  .map((alt) => (
                    <AlternativeRow key={alt.variant} alt={alt} isActual={false} />
                  ))}
              </tbody>
            </table>
            <p className="mt-3 text-[10px] text-[var(--text-muted)]">
              Counterfactual: replaces this round&apos;s decision, then replays remaining
              rounds with your actual choices. Not a prediction.
            </p>
          </div>
        )}
      </Card>
    </MotionItem>
  );
}

export function WhatIfPanel({ analysis }: { analysis: WhatIfAnalysis }) {
  return (
    <div className="space-y-4">
      <MotionItem>
        <Card padding="sm">
          <Badge variant="warning" className="mb-2">
            Counterfactual Analysis
          </Badge>
          <p className="text-xs leading-relaxed text-[var(--text-muted)]">
            {analysis.disclaimer}
          </p>
        </Card>
      </MotionItem>

      {analysis.rounds.map((round) => (
        <RoundWhatIfCard key={round.roundId} round={round} />
      ))}
    </div>
  );
}
