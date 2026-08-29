"use client";

import { useMemo, useState } from "react";
import type { DNAScoreResult } from "@/lib/dna/types";
import { cn } from "@/lib/utils";

interface DNAEvolutionChartProps {
  scores: DNAScoreResult[] | null;
}

export function DNAEvolutionChart({ scores }: DNAEvolutionChartProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const series = useMemo(() => {
    if (!scores?.length) return [];
    return scores.map((s) => ({ id: s.id, label: s.label.replace(" Score", ""), value: s.score }));
  }, [scores]);

  const highlighted = activeId ?? series[0]?.id;
  const active = series.find((s) => s.id === highlighted);

  const w = 480;
  const h = 200;
  const pad = 24;

  const points = series.map((s, i) => {
    const x = pad + (i / Math.max(series.length - 1, 1)) * (w - pad * 2);
    const y = pad + (1 - s.value / 100) * (h - pad * 2);
    return { ...s, x, y };
  });

  const linePath = points.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPath =
    points.length > 0
      ? `M ${points[0].x} ${h - pad} ` +
        points.map((p) => `L ${p.x} ${p.y}`).join(" ") +
        ` L ${points[points.length - 1].x} ${h - pad} Z`
      : "";

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-[var(--text-heading)]">
          Trading DNA Evolution
        </h3>
        <div className="flex flex-wrap gap-1">
          {series.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveId(s.id)}
              className={cn(
                "rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors",
                highlighted === s.id
                  ? "bg-[var(--surface-muted)] text-[var(--text-heading)]"
                  : "bg-[var(--surface-inset)] text-[var(--text-muted)] hover:text-[var(--text-heading)]",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {!scores?.length ? (
        <div className="flex h-[200px] items-center justify-center rounded-xl border border-dashed border-[var(--border-subtle)] bg-[var(--surface-inset)] text-sm text-[var(--text-muted)]">
          Run analysis to view DNA scores
        </div>
      ) : (
        <>
          <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="DNA scores chart">
            <defs>
              <linearGradient id="dnaArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            {[0, 25, 50, 75, 100].map((tick) => {
              const y = pad + (1 - tick / 100) * (h - pad * 2);
              return (
                <line
                  key={tick}
                  x1={pad}
                  y1={y}
                  x2={w - pad}
                  y2={y}
                  stroke="var(--border-subtle)"
                  strokeDasharray="4 4"
                />
              );
            })}
            <path d={areaPath} fill="url(#dnaArea)" />
            <polyline
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={linePath}
            />
            {points.map((p) => (
              <circle
                key={p.id}
                cx={p.x}
                cy={p.y}
                r={highlighted === p.id ? 6 : 4}
                fill={highlighted === p.id ? "var(--accent)" : "white"}
                stroke="var(--accent)"
                strokeWidth="2"
              />
            ))}
          </svg>
          {active && (
            <p className="mt-3 font-data text-sm text-[var(--text-muted)]">
              <span className="font-semibold text-[var(--accent)]">{active.label}</span>
              {": "}
              <span className="text-[var(--text-heading)]">{Math.round(active.value)}/100</span>
              <span className="text-[var(--text-faint)]"> · current snapshot</span>
            </p>
          )}
        </>
      )}
    </div>
  );
}
