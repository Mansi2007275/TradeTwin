export type TradeSide = "BUY" | "HOLD" | "SELL";

export interface DNAScore {
  id: string;
  label: string;
  score: number;
  confidence: number;
  explanation: string;
  evidence: string[];
}

export interface TradingTwin {
  name: string;
  version: string;
  createdAt: string;
  behaviorSummary: string;
  traits: string[];
}

export interface MarketSnapshot {
  symbol: string;
  price: number;
  changePercent: number;
  volume24h: number;
  high24h: number;
  low24h: number;
}

export interface SimulationRound {
  round: number;
  market: MarketSnapshot;
  userDecision: TradeSide;
  twinDecision: TradeSide;
  userPortfolioValue: number;
  twinPortfolioValue: number;
}

export interface SimulationResult {
  userReturn: number;
  twinReturn: number;
  winner: "user" | "twin" | "tie";
  behavioralExplanation: string;
  improvementScore: number;
  rounds: SimulationRound[];
}

export interface WalletInfo {
  address: string;
  network: string;
  chainId: number;
  isCorrectNetwork: boolean;
  transactionCount: number;
}
