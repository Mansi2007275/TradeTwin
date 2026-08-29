"use client";

import type { MarketSnapshot } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { MarketStat } from "@/components/ui/StatCard";
import { CountUpCurrency, CountUpPercent } from "@/components/motion/CountUp";
import { MotionItem } from "@/components/motion/MotionStagger";
import { cn } from "@/lib/utils";

interface MarketPanelProps {
  market: MarketSnapshot;
}

export function MarketPanel({ market }: MarketPanelProps) {
  const isPositive = market.changePercent >= 0;

  return (
    <MotionItem>
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[var(--text-muted)]">{market.symbol}</p>
            <p className="mt-1 text-3xl font-bold tabular-nums text-[var(--text-heading)]">
              <CountUpCurrency value={market.price} />
            </p>
            <p
              className={cn(
                "mt-1 text-sm font-medium tabular-nums",
                isPositive ? "text-[var(--success)]" : "text-[var(--error)]",
              )}
            >
              <CountUpPercent value={market.changePercent} /> (24h)
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-6">
            <MarketStat label="24h Volume" value={`$${(market.volume24h / 1_000_000).toFixed(1)}M`} />
            <MarketStat label="24h High" value={`$${market.high24h.toLocaleString()}`} />
            <MarketStat label="24h Low" value={`$${market.low24h.toLocaleString()}`} />
          </div>
        </div>
      </Card>
    </MotionItem>
  );
}
