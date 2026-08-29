import type { BehaviourProfile, Trade } from "@/lib/analysis/types";
import type { TradingDNA } from "@/lib/dna/types";
import type { TwinHistoricalPatterns, TwinProfile, TwinWeights } from "./types";

const TWIN_VERSION = "v1.0.0";

function dnaWeight(score: number): number {
  return Math.max(0, Math.min(1, score / 100));
}

function buildWeights(dna: TradingDNA): TwinWeights {
  const get = (id: string) => dna.scores.find((s) => s.id === id)?.score ?? 50;
  return {
    fomo: dnaWeight(get("fomo")),
    risk: dnaWeight(get("risk")),
    patience: dnaWeight(get("patience")),
    momentum: dnaWeight(get("momentum")),
    overtrading: dnaWeight(get("overtrading")),
  };
}

function buildPatterns(
  profile: BehaviourProfile,
  trades: Trade[],
): TwinHistoricalPatterns {
  const actionable = trades.filter((t) => t.side === "BUY" || t.side === "SELL");
  const buys = actionable.filter((t) => t.side === "BUY").length;
  const sells = actionable.filter((t) => t.side === "SELL").length;
  const total = Math.max(actionable.length, 1);

  const pumpRate = profile.entryAfterPump.frequency.value / 100;
  const postLossMult = profile.tradingAfterLoss.frequencyMultiplier.value;

  return {
    buyRate: buys / total,
    sellRate: sells / total,
    holdTendency: Math.max(0.1, 1 - (buys + sells) / Math.max(total * 1.5, 1)),
    buyAfterPumpRate: pumpRate,
    sellAfterLossRate: profile.tradingAfterLoss.rebuyWithin24hRate.value / 100,
    avgWinnerHoldHours: profile.earlyExit.avgWinnerHoldHours.value,
    avgLoserHoldHours: profile.earlyExit.avgLoserHoldHours.value,
    tradesPerWeek: profile.overtrading.tradesPerWeek.value,
    postLossTradeMultiplier: postLossMult,
    earlyExitRate: profile.earlyExit.earlyWinnerExitRate.value / 100,
    avgPositionSizePct: profile.positionSizeBehaviour.averagePositionSizePct.value,
  };
}

function baselineProbabilities(
  patterns: TwinHistoricalPatterns,
  tradeCount: number,
) {
  if (tradeCount < 3) {
    return { buy: 0.33, hold: 0.34, sell: 0.33 };
  }

  const rawBuy = patterns.buyRate * 0.7 + patterns.buyAfterPumpRate * 0.3;
  const rawSell = patterns.sellRate * 0.7 + patterns.earlyExitRate * 0.3;
  const rawHold = patterns.holdTendency;

  const sum = rawBuy + rawSell + rawHold || 1;
  return {
    buy: rawBuy / sum,
    hold: rawHold / sum,
    sell: rawSell / sum,
  };
}

export function buildTwinProfile(
  profile: BehaviourProfile,
  dna: TradingDNA,
  trades: Trade[],
): TwinProfile {
  const patterns = buildPatterns(profile, trades);
  const weights = buildWeights(dna);
  const tradeCount = profile.tradeCount;
  const lowDataMode = tradeCount < 3;

  return {
    walletAddress: profile.walletAddress,
    version: TWIN_VERSION,
    builtAt: new Date().toISOString(),
    name: `Twin-${profile.walletAddress.slice(2, 6)}`,
    baselineProbabilities: baselineProbabilities(patterns, tradeCount),
    weights,
    patterns,
    confidence: dna.overallConfidence,
    tradeCount,
    lowDataMode,
  };
}

export { TWIN_VERSION };
