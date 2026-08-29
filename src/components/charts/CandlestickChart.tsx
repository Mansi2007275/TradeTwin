"use client";

import type { MarketSnapshot } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CandlestickChartProps {
  market: MarketSnapshot;
  className?: string;
}

export function CandlestickChart({ market, className }: CandlestickChartProps) {
  const isUp = market.changePercent >= 0;
  const candles = [
    { o: market.low24h, c: market.price, h: market.high24h, l: market.low24h },
    { o: market.price * 0.995, c: market.price * 1.01, h: market.high24h, l: market.low24h * 1.002 },
    { o: market.price * 1.008, c: market.price * 0.992, h: market.high24h * 0.998, l: market.low24h },
    { o: market.price * 0.99, c: market.price, h: market.high24h, l: market.low24h },
    { o: market.price, c: market.price * (1 + market.changePercent / 200), h: market.high24h, l: market.low24h },
  ];

  const allPrices = candles.flatMap((c) => [c.h, c.l]);
  const min = Math.min(...allPrices);
  const max = Math.max(...allPrices);
  const range = max - min || 1;

  const w = 280;
  const h = 180;
  const pad = 16;
  const slot = (w - pad * 2) / candles.length;

  return (
    <div className={cn("rounded-xl border border-[var(--border-subtle)] bg-white p-5 shadow-sm", className)}>
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-heading)]">Simulation Market</h3>
          <p className="text-xs text-[var(--text-muted)]">{market.symbol}</p>
        </div>
        <div className="text-right">
          <p className="font-data text-lg font-bold text-[var(--text-display)]">
            ${market.price.toLocaleString()}
          </p>
          <p
            className={cn(
              "font-data text-xs font-medium",
              isUp ? "text-[var(--success)]" : "text-[var(--error)]",
            )}
          >
            {isUp ? "↑" : "↓"} {Math.abs(market.changePercent).toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="mb-3 flex gap-2 text-[10px] font-medium uppercase tracking-wide">
        <span className="rounded-md bg-[rgba(26,157,92,0.1)] px-2 py-0.5 text-[var(--success)]">
          Buy ${market.low24h.toFixed(0)}
        </span>
        <span className="rounded-md bg-[rgba(214,59,59,0.1)] px-2 py-0.5 text-[var(--error)]">
          Sell ${market.high24h.toFixed(0)}
        </span>
      </div>

      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Market candlestick chart">
        {candles.map((c, i) => {
          const cx = pad + slot * i + slot / 2;
          const yHigh = pad + (1 - (c.h - min) / range) * (h - pad * 2);
          const yLow = pad + (1 - (c.l - min) / range) * (h - pad * 2);
          const yOpen = pad + (1 - (c.o - min) / range) * (h - pad * 2);
          const yClose = pad + (1 - (c.c - min) / range) * (h - pad * 2);
          const up = c.c >= c.o;
          const bodyTop = Math.min(yOpen, yClose);
          const bodyH = Math.max(Math.abs(yClose - yOpen), 2);
          const color = up ? "var(--success)" : "var(--error)";

          return (
            <g key={i}>
              <line x1={cx} y1={yHigh} x2={cx} y2={yLow} stroke={color} strokeWidth="1.5" />
              <rect
                x={cx - slot * 0.22}
                y={bodyTop}
                width={slot * 0.44}
                height={bodyH}
                fill={color}
                rx="1"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
