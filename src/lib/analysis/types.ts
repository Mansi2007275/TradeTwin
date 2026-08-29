export type TradeSide = "BUY" | "SELL";

export interface Trade {
  transactionHash: string;
  token: string;
  side: TradeSide;
  amount: number;
  price: number;
  timestamp: number;
  gasUsed: number;
  pnl?: number;
}

export interface MetricResult<T = number> {
  value: T;
  confidence: number;
  sampleSize: number;
  insufficientData: boolean;
  label: string;
  unit?: string;
}

export interface ClosedPosition {
  token: string;
  entryTimestamp: number;
  exitTimestamp: number;
  holdTimeMs: number;
  pnl: number;
  entryPrice: number;
  exitPrice: number;
  amount: number;
}

export interface BehaviourProfile {
  walletAddress: string;
  analyzedAt: string;
  tradeCount: number;
  closedPositionCount: number;
  dateRange: { start: number; end: number } | null;
  dataSource: string;

  tradingFrequency: MetricResult;
  averageHoldingTime: MetricResult;
  winRate: MetricResult;
  averageWinningTrade: MetricResult;
  averageLosingTrade: MetricResult;

  positionSizeBehaviour: {
    averagePositionSizePct: MetricResult;
    maxPositionSizePct: MetricResult;
    positionSizeStdDev: MetricResult;
  };

  entryAfterPump: {
    frequency: MetricResult;
    averageLagHours: MetricResult;
    pumpThresholdPct: number;
  };

  tradingAfterLoss: {
    frequencyMultiplier: MetricResult;
    rebuyWithin24hRate: MetricResult;
  };

  earlyExit: {
    avgWinnerHoldHours: MetricResult;
    avgLoserHoldHours: MetricResult;
    holdTimeRatio: MetricResult;
    earlyWinnerExitRate: MetricResult;
  };

  overtrading: {
    tradesPerWeek: MetricResult;
    peakWeekTrades: MetricResult;
    peakToAverageRatio: MetricResult;
    burstAfterLossDays: MetricResult;
  };
}

export interface RawTransfer {
  transactionHash: string;
  token: string;
  tokenSymbol: string;
  direction: "in" | "out";
  amount: number;
  timestamp: number;
  gasUsed: number;
  blockNumber: number;
}
