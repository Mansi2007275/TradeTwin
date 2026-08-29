import type { TradeSide } from "@/lib/types";

export interface TwinHistoricalPatterns {
  buyRate: number;
  sellRate: number;
  holdTendency: number;
  buyAfterPumpRate: number;
  sellAfterLossRate: number;
  avgWinnerHoldHours: number;
  avgLoserHoldHours: number;
  tradesPerWeek: number;
  postLossTradeMultiplier: number;
  earlyExitRate: number;
  avgPositionSizePct: number;
}

export interface TwinWeights {
  fomo: number;
  risk: number;
  patience: number;
  momentum: number;
  overtrading: number;
}

export interface TwinProfile {
  walletAddress: string;
  version: string;
  builtAt: string;
  name: string;
  baselineProbabilities: {
    buy: number;
    hold: number;
    sell: number;
  };
  weights: TwinWeights;
  patterns: TwinHistoricalPatterns;
  confidence: number;
  tradeCount: number;
}

export interface SimulationState {
  round: number;
  priceChangePercent: number;
  volatility: number;
  volumeChangePercent: number;
  previousOutcome: "win" | "loss" | "neutral" | null;
  consecutiveLosses: number;
  positionSizeRelative: number;
  hoursSinceLastTrade: number;
  currentExposure: number;
  hasOpenPosition: boolean;
}

export interface TwinDecisionResult {
  buyProbability: number;
  holdProbability: number;
  sellProbability: number;
  confidence: number;
  reasonCodes: string[];
  decision: TradeSide;
  explanation: string;
}

export type TwinReasonCode =
  | "BASELINE_BEHAVIOUR"
  | "MOMENTUM_PUMP_ENTRY"
  | "FOMO_CHASE"
  | "REACTIVE_SELL_AFTER_LOSSES"
  | "OVERTRADE_AFTER_LOSS"
  | "EARLY_WINNER_EXIT"
  | "HOLD_LOSER"
  | "HIGH_EXPOSURE_CAUTION"
  | "AGGRESSIVE_SIZE_UP"
  | "HIGH_VOLATILITY_HOLD"
  | "TREND_CONTINUATION_HOLD"
  | "NO_POSITION_WAIT";
