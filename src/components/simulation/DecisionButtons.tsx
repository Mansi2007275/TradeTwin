"use client";

import type { TradeSide } from "@/lib/types";
import { cn } from "@/lib/utils";

interface DecisionButtonsProps {
  onDecision: (decision: TradeSide) => void;
  disabled?: boolean;
  selected?: TradeSide | null;
}

const decisions: { side: TradeSide; label: string }[] = [
  { side: "BUY", label: "Buy" },
  { side: "HOLD", label: "Hold" },
  { side: "SELL", label: "Sell" },
];

export function DecisionButtons({ onDecision, disabled, selected }: DecisionButtonsProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {decisions.map(({ side, label }) => (
        <button
          key={side}
          type="button"
          disabled={disabled}
          onClick={() => onDecision(side)}
          className={cn(
            "rounded-lg border border-[var(--border-subtle)] bg-white px-3 py-3 text-sm font-semibold text-[var(--text-heading)] transition-colors hover:bg-[var(--surface-inset)]",
            selected === side && "border-[var(--text-heading)] bg-[var(--surface-muted)]",
            disabled && "opacity-50",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

interface DecisionDisplayProps {
  label: string;
  decision: TradeSide | null;
  highlight?: boolean;
}

export function DecisionDisplay({ label, decision, highlight }: DecisionDisplayProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-[var(--border-subtle)] bg-white p-4",
        highlight && "bg-[var(--surface-inset)]",
      )}
    >
      <p className="type-eyebrow">{label}</p>
      {decision ? (
        <p className="brutal-chip mt-2">{decision}</p>
      ) : (
        <p className="mt-2 text-sm text-[var(--text-muted)]">Waiting…</p>
      )}
    </div>
  );
}
