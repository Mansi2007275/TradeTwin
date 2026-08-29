"use client";

import { useEffect, useState } from "react";
import { useMotionValueEvent, useSpring } from "framer-motion";
import type { TwinDecisionResult } from "@/lib/twin/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MotionItem } from "@/components/motion/MotionStagger";

function ProbBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const spring = useSpring(0, { duration: 600, bounce: 0 });
  const [width, setWidth] = useState(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    spring.set(value * 100);
  }, [value, spring]);

  useMotionValueEvent(spring, "change", (v) => {
    setWidth(v);
    setDisplay(v);
  });

  return (
    <div className="flex items-center gap-3">
      <span className="w-10 text-xs text-[var(--text-muted)]">{label}</span>
      <div className="neo-inset-sm h-3 flex-1 overflow-hidden rounded-full p-0.5">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="w-12 text-right text-xs tabular-nums text-[var(--text-muted)]">
        {Math.round(display)}%
      </span>
    </div>
  );
}

export function TwinDecisionPanel({ result }: { result: TwinDecisionResult }) {
  const bars = [
    { label: "Buy", value: result.buyProbability, color: "bg-[var(--success)]" },
    { label: "Hold", value: result.holdProbability, color: "bg-[var(--text-muted)]" },
    { label: "Sell", value: result.sellProbability, color: "bg-[var(--error)]" },
  ];

  return (
    <MotionItem>
      <Card padding="sm">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
            Twin Decision Model
          </span>
          <Badge variant="info">{Math.round(result.confidence * 100)}% confidence</Badge>
          <Badge variant="default">{result.decision}</Badge>
        </div>

        <div className="space-y-2">
          {bars.map((bar) => (
            <ProbBar key={bar.label} {...bar} />
          ))}
        </div>

        <p className="mt-3 text-xs leading-relaxed text-[var(--text-muted)]">
          {result.explanation}
        </p>

        <div className="mt-2 flex flex-wrap gap-1">
          {result.reasonCodes.map((code) => (
            <span
              key={code}
              className="neo-inset-sm rounded-lg px-1.5 py-0.5 font-mono text-[10px] text-[var(--text-muted)]"
            >
              {code}
            </span>
          ))}
        </div>
      </Card>
    </MotionItem>
  );
}
