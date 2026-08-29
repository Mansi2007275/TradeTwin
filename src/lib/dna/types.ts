export type DNAId = "fomo" | "risk" | "patience" | "momentum" | "overtrading";

export interface DNAScoreResult {
  id: DNAId;
  label: string;
  score: number;
  confidence: number;
  lowConfidence: boolean;
  formula: string;
  evidence: string[];
  inputs: Record<string, number>;
}

export interface TradingDNA {
  walletAddress: string;
  computedAt: string;
  scores: DNAScoreResult[];
  overallConfidence: number;
  tradeCount: number;
}

export function getDNAScore(dna: TradingDNA, id: DNAId): DNAScoreResult | undefined {
  return dna.scores.find((s) => s.id === id);
}
