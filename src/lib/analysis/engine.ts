import type { BehaviourProfile, Trade } from "./types";
import { assignTradePnl } from "./positions";
import {
  analyzeAverageHoldingTime,
  analyzeAverageLosingTrade,
  analyzeAverageWinningTrade,
  analyzeEarlyExit,
  analyzeEntryAfterPump,
  analyzeOvertrading,
  analyzePositionSize,
  analyzeTradingAfterLoss,
  analyzeTradingFrequency,
  analyzeWinRate,
  matchPositions,
} from "./metrics";

export function analyzeBehaviour(
  trades: Trade[],
  walletAddress: string,
  dataSource = "on-chain",
): BehaviourProfile {
  const enriched = assignTradePnl(trades);
  const closed = matchPositions(enriched);

  const timestamps = trades.map((t) => t.timestamp);
  const dateRange =
    timestamps.length > 0
      ? { start: Math.min(...timestamps), end: Math.max(...timestamps) }
      : null;

  return {
    walletAddress,
    analyzedAt: new Date().toISOString(),
    tradeCount: trades.length,
    closedPositionCount: closed.length,
    dateRange,
    dataSource,

    tradingFrequency: analyzeTradingFrequency(trades),
    averageHoldingTime: analyzeAverageHoldingTime(closed),
    winRate: analyzeWinRate(closed),
    averageWinningTrade: analyzeAverageWinningTrade(closed),
    averageLosingTrade: analyzeAverageLosingTrade(closed),

    positionSizeBehaviour: analyzePositionSize(trades),
    entryAfterPump: analyzeEntryAfterPump(trades),
    tradingAfterLoss: analyzeTradingAfterLoss(enriched),
    earlyExit: analyzeEarlyExit(closed),
    overtrading: analyzeOvertrading(enriched),
  };
}

export type { Trade, BehaviourProfile } from "./types";
