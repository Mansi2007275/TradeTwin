import type { MarketSnapshot, TradeSide } from "@/lib/types";
import type { TwinDecisionResult } from "@/lib/twin/types";

export const INITIAL_PORTFOLIO = 10_000;
export const SIMULATION_ROUNDS = 5;

export interface Portfolio {
  cash: number;
  eth: number;
}

export interface DivergenceAnalysis {
  diverged: boolean;
  codes: string[];
  reasons: string[];
}

export interface RoundRecord {
  roundId: number;
  timestamp: string;
  market: MarketSnapshot;
  userDecision: TradeSide;
  twinDecision: TradeSide;
  twinResult: TwinDecisionResult;
  userPortfolioBefore: number;
  twinPortfolioBefore: number;
  userPortfolioAfter: number;
  twinPortfolioAfter: number;
  divergence: DivergenceAnalysis;
}

export interface SimulationSession {
  id: string;
  startedAt: string;
  initialBalance: number;
  currentRound: number;
  totalRounds: number;
  userPortfolio: Portfolio;
  twinPortfolio: Portfolio;
  twinConsecutiveLosses: number;
  twinLastOutcome: "win" | "loss" | "neutral" | null;
  completedRounds: RoundRecord[];
  status: "active" | "complete";
}

export interface SimulationOutcome {
  userReturn: number;
  twinReturn: number;
  winner: "user" | "twin" | "tie";
  improvementScore: number;
  behavioralExplanation: string;
  rounds: RoundRecord[];
  finalUserValue: number;
  finalTwinValue: number;
}
