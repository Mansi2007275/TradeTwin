import type { TradeSide } from "@/lib/types";
import type {
  SimulationState,
  TwinDecisionResult,
  TwinProfile,
  TwinReasonCode,
} from "./types";
import { explainReasonCodes } from "./reasons";

function softmax(scores: [number, number, number]): [number, number, number] {
  const max = Math.max(...scores);
  const exps = scores.map((s) => Math.exp(s - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum) as [number, number, number];
}

function toDecision(probs: [number, number, number]): TradeSide {
  const [buy, hold, sell] = probs;
  if (buy >= hold && buy >= sell) return "BUY";
  if (sell >= hold && sell >= buy) return "SELL";
  return "HOLD";
}

/**
 * Deterministic behavioural twin — models user's historical decision patterns.
 * Does NOT predict market direction.
 */
export function computeTwinDecision(
  twin: TwinProfile,
  state: SimulationState,
): TwinDecisionResult {
  const reasonCodes: TwinReasonCode[] = ["BASELINE_BEHAVIOUR"];
  if (twin.lowDataMode) {
    reasonCodes.push("INSUFFICIENT_HISTORY");
  }
  const { weights, patterns, baselineProbabilities: base } = twin;

  let buyScore = Math.log(base.buy + 0.01);
  let holdScore = Math.log(base.hold + 0.01);
  let sellScore = Math.log(base.sell + 0.01);

  const pump = state.priceChangePercent;
  const isPump = pump >= patterns.buyAfterPumpRate * 10 || pump >= 5;

  if (isPump && !state.hasOpenPosition) {
    const fomoBoost = weights.fomo * (pump / 10) * 0.8;
    const momentumBoost = weights.momentum * (pump / 10) * 0.6;
    buyScore += fomoBoost + momentumBoost;
    if (weights.fomo > 0.55) reasonCodes.push("FOMO_CHASE");
    if (weights.momentum > 0.55) reasonCodes.push("MOMENTUM_PUMP_ENTRY");
  }

  if (state.previousOutcome === "loss") {
    if (weights.overtrading > 0.45) {
      buyScore += weights.overtrading * patterns.postLossTradeMultiplier * 0.15;
      reasonCodes.push("OVERTRADE_AFTER_LOSS");
    }
    if (state.consecutiveLosses >= 2 && weights.patience < 0.5) {
      sellScore += (1 - weights.patience) * 0.45;
      reasonCodes.push("REACTIVE_SELL_AFTER_LOSSES");
    }
  }

  if (state.hasOpenPosition) {
    if (pump > 0 && weights.patience < 0.45) {
      sellScore += (1 - weights.patience) * patterns.earlyExitRate * 0.5;
      reasonCodes.push("EARLY_WINNER_EXIT");
    }
    if (pump < -2 && weights.patience < 0.55) {
      holdScore += (1 - weights.patience) * 0.35;
      reasonCodes.push("HOLD_LOSER");
    }
    if (pump > 0 && pump < 5 && weights.momentum > 0.5) {
      holdScore += weights.momentum * 0.2;
      reasonCodes.push("TREND_CONTINUATION_HOLD");
    }
  }

  if (state.currentExposure > 0.6 || state.positionSizeRelative > 1.3) {
    buyScore -= weights.risk * 0.25;
    reasonCodes.push("HIGH_EXPOSURE_CAUTION");
  } else if (
    state.positionSizeRelative < 0.8 &&
    weights.risk > 0.55 &&
    !state.hasOpenPosition
  ) {
    buyScore += weights.risk * 0.2;
    reasonCodes.push("AGGRESSIVE_SIZE_UP");
  }

  if (state.volatility > 4) {
    holdScore += 0.2;
    reasonCodes.push("HIGH_VOLATILITY_HOLD");
  }

  if (
    !state.hasOpenPosition &&
    Math.abs(pump) < 2 &&
    state.hoursSinceLastTrade < 48 / Math.max(patterns.tradesPerWeek, 1)
  ) {
    holdScore += 0.15;
    reasonCodes.push("NO_POSITION_WAIT");
  }

  const probs = softmax([buyScore, holdScore, sellScore]);
  const decision = toDecision(probs);
  const decisionStrength = Math.round(Math.max(...probs) * 1000) / 1000;
  const dataConfidence = twin.confidence;
  const confidence = Math.round(decisionStrength * dataConfidence * 1000) / 1000;

  const uniqueCodes = [...new Set(reasonCodes)];

  return {
    buyProbability: Math.round(probs[0] * 1000) / 1000,
    holdProbability: Math.round(probs[1] * 1000) / 1000,
    sellProbability: Math.round(probs[2] * 1000) / 1000,
    confidence,
    decisionStrength,
    dataConfidence,
    reasonCodes: uniqueCodes,
    decision,
    explanation: explainReasonCodes(uniqueCodes),
  };
}

export function buildSimulationState(
  partial: Partial<SimulationState> & Pick<SimulationState, "round" | "priceChangePercent">,
): SimulationState {
  return {
    round: partial.round,
    priceChangePercent: partial.priceChangePercent,
    volatility: partial.volatility ?? Math.abs(partial.priceChangePercent),
    volumeChangePercent: partial.volumeChangePercent ?? 0,
    previousOutcome: partial.previousOutcome ?? null,
    consecutiveLosses: partial.consecutiveLosses ?? 0,
    positionSizeRelative: partial.positionSizeRelative ?? 1,
    hoursSinceLastTrade: partial.hoursSinceLastTrade ?? 24,
    currentExposure: partial.currentExposure ?? 0,
    hasOpenPosition: partial.hasOpenPosition ?? false,
  };
}
