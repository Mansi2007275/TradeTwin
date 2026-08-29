import type { MarketSnapshot } from "@/lib/types";
import type { DailyPricePoint } from "./types";
import { sortPriceSeries } from "./price-lookup";

const SIMULATION_ROUND_COUNT = 5;

export function buildSimulationRoundsFromPrices(
  prices: DailyPricePoint[],
): MarketSnapshot[] {
  const sorted = sortPriceSeries(prices);
  if (sorted.length < SIMULATION_ROUND_COUNT + 1) {
    throw new Error(
      `CoinGecko returned insufficient price history (need ${SIMULATION_ROUND_COUNT + 1}+ daily points)`,
    );
  }

  const slice = sorted.slice(-30);
  const step = Math.max(1, Math.floor(slice.length / SIMULATION_ROUND_COUNT));
  const picks: DailyPricePoint[] = [];

  for (let i = 0; i < SIMULATION_ROUND_COUNT; i++) {
    const idx = Math.min(slice.length - 1, i * step);
    picks.push(slice[idx]);
  }

  return picks.map((point, index) => {
    const prev =
      index === 0
        ? slice[Math.max(0, picks[0] === point ? 0 : slice.indexOf(point) - 1)]
        : picks[index - 1];
    const changePercent =
      prev && prev.price > 0 ? ((point.price - prev.price) / prev.price) * 100 : 0;

    const swing = Math.max(point.price * 0.012, 12);

    return {
      symbol: "ETH/USD",
      price: Math.round(point.price * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      volume24h: Math.round(point.volume),
      high24h: Math.round((point.price + swing) * 100) / 100,
      low24h: Math.round((point.price - swing) * 100) / 100,
    };
  });
}
