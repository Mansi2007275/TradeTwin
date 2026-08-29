import type { BehaviourProfile } from "@/lib/analysis/types";
import type { TradingDNA } from "./types";
import { computeDNAScores } from "./scoring";
import { combineConfidence } from "./math";

export function computeTradingDNA(profile: BehaviourProfile): TradingDNA {
  const scores = computeDNAScores(profile);

  return {
    walletAddress: profile.walletAddress,
    computedAt: new Date().toISOString(),
    scores,
    overallConfidence: combineConfidence(...scores.map((s) => s.confidence)),
    tradeCount: profile.tradeCount,
  };
}

export function generateBehaviorSummary(dna: TradingDNA): string {
  const fomo = dna.scores.find((s) => s.id === "fomo");
  const risk = dna.scores.find((s) => s.id === "risk");
  const patience = dna.scores.find((s) => s.id === "patience");
  const momentum = dna.scores.find((s) => s.id === "momentum");
  const overtrading = dna.scores.find((s) => s.id === "overtrading");

  const traits: string[] = [];

  if (fomo && fomo.score >= 60) {
    traits.push("chases entries after price pumps");
  }
  if (momentum && momentum.score >= 60) {
    traits.push("favours trending markets over pullbacks");
  }
  if (risk && risk.score >= 60) {
    traits.push("sizes positions aggressively");
  }
  if (patience && patience.score < 40) {
    traits.push("exits winners quickly but holds losers");
  }
  if (overtrading && overtrading.score >= 55) {
    traits.push("increases trade frequency after losses");
  }

  if (traits.length === 0) {
    return "This twin mirrors your measured on-chain trading patterns. It replays your historical decision behaviour — it does not predict market direction.";
  }

  return `This twin mirrors your tendency to ${traits.join(", ")}. It replays your historical decision behaviour — it does not predict market direction.`;
}

export function generateTwinTraits(dna: TradingDNA): string[] {
  return dna.scores.map((s) => {
    const level =
      s.score >= 70 ? "High" : s.score >= 40 ? "Moderate" : "Low";
    const key = s.label.replace(" Score", "");
    return `${level} ${key} (${s.score}/100, ${Math.round(s.confidence * 100)}% confidence)`;
  });
}

export type { TradingDNA, DNAScoreResult } from "./types";
