import type { DailyPricePoint } from "./types";

export function sortPriceSeries(prices: DailyPricePoint[]): DailyPricePoint[] {
  return [...prices].sort((a, b) => a.timestamp - b.timestamp);
}

/** Nearest daily price at or before the given timestamp. */
export function getPriceAtTimestamp(
  prices: DailyPricePoint[],
  timestamp: number,
): number {
  const sorted = sortPriceSeries(prices);
  if (sorted.length === 0) return 1;

  let best = sorted[0];
  for (const point of sorted) {
    if (point.timestamp <= timestamp) {
      best = point;
    } else {
      break;
    }
  }
  return best.price;
}

export function findPumpIndices(
  prices: DailyPricePoint[],
  lookbackDays = 5,
  thresholdPct = 8,
): number[] {
  const sorted = sortPriceSeries(prices);
  const pumps: number[] = [];

  for (let i = lookbackDays; i < sorted.length; i++) {
    const window = sorted.slice(i - lookbackDays, i);
    const minPrior = Math.min(...window.map((p) => p.price));
    const current = sorted[i].price;
    if (minPrior <= 0) continue;

    const changePct = ((current - minPrior) / minPrior) * 100;
    if (changePct >= thresholdPct) {
      pumps.push(i);
    }
  }

  return pumps;
}

export function findDipIndices(
  prices: DailyPricePoint[],
  lookbackDays = 5,
  thresholdPct = 6,
): number[] {
  const sorted = sortPriceSeries(prices);
  const dips: number[] = [];

  for (let i = lookbackDays; i < sorted.length; i++) {
    const window = sorted.slice(i - lookbackDays, i);
    const maxPrior = Math.max(...window.map((p) => p.price));
    const current = sorted[i].price;
    if (maxPrior <= 0) continue;

    const changePct = ((maxPrior - current) / maxPrior) * 100;
    if (changePct >= thresholdPct) {
      dips.push(i);
    }
  }

  return dips;
}
