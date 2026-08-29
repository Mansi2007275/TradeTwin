import type { TradingDNA, DNAId } from "@/lib/dna/types";
import { getDNAScore } from "@/lib/dna/types";
import type { TradeSide } from "@/lib/types";
import type { TwinProfile, TwinReasonCode } from "@/lib/twin/types";
import { REASON_EXPLANATIONS } from "@/lib/twin/reasons";
import type { RoundRecord } from "./types";

export interface WhyWeDifferedExplanation {
  roundId: number;
  diverged: boolean;
  userDecision: TradeSide;
  twinDecision: TradeSide;
  userActionLine: string;
  twinActionLine: string;
  patternLine: string;
  dominantPatternLabel: string;
  matchedHistoricalPattern: boolean;
  evidenceSnippet: string;
  twinRationale: string;
}

export interface BehavioralSessionSummary {
  totalRounds: number;
  alignedRounds: number;
  divergedRounds: number;
  matchedPatternRounds: number;
  brokePatternRounds: number;
  headline: string;
  detailLines: string[];
}

const REASON_TO_DNA: Partial<Record<TwinReasonCode, DNAId>> = {
  FOMO_CHASE: "fomo",
  MOMENTUM_PUMP_ENTRY: "momentum",
  OVERTRADE_AFTER_LOSS: "overtrading",
  REACTIVE_SELL_AFTER_LOSSES: "patience",
  EARLY_WINNER_EXIT: "patience",
  HOLD_LOSER: "patience",
  AGGRESSIVE_SIZE_UP: "risk",
  HIGH_EXPOSURE_CAUTION: "risk",
  HIGH_VOLATILITY_HOLD: "patience",
  TREND_CONTINUATION_HOLD: "momentum",
  NO_POSITION_WAIT: "patience",
};

const PATTERN_LABELS: Partial<Record<TwinReasonCode, string>> = {
  FOMO_CHASE: "FOMO",
  MOMENTUM_PUMP_ENTRY: "momentum-chase",
  OVERTRADE_AFTER_LOSS: "overtrading",
  REACTIVE_SELL_AFTER_LOSSES: "reactive-exit",
  EARLY_WINNER_EXIT: "early-exit",
  HOLD_LOSER: "hold-loser",
  AGGRESSIVE_SIZE_UP: "risk-on sizing",
  HIGH_EXPOSURE_CAUTION: "risk-caution",
  HIGH_VOLATILITY_HOLD: "volatility-hold",
  TREND_CONTINUATION_HOLD: "trend-hold",
  NO_POSITION_WAIT: "wait-and-see",
  BASELINE_BEHAVIOUR: "baseline",
};

function ordinal(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n}st`;
  if (mod10 === 2 && mod100 !== 12) return `${n}nd`;
  if (mod10 === 3 && mod100 !== 13) return `${n}rd`;
  return `${n}th`;
}

function primaryReasonCode(codes: string[]): TwinReasonCode {
  const found = codes.find((c) => c !== "BASELINE_BEHAVIOUR");
  return (found ?? "BASELINE_BEHAVIOUR") as TwinReasonCode;
}

function similarHistoricalCount(
  twinDecision: TradeSide,
  marketChangePercent: number,
  twin: TwinProfile,
): { similar: number; total: number } {
  const total = Math.max(twin.tradeCount, 1);
  const { patterns } = twin;
  const isPump = marketChangePercent >= 3;

  if (twinDecision === "BUY") {
    const rate = isPump ? patterns.buyAfterPumpRate : patterns.buyRate;
    return { similar: Math.max(1, Math.round(rate * total)), total };
  }
  if (twinDecision === "SELL") {
    const rate = patterns.sellRate;
    return { similar: Math.max(1, Math.round(rate * total)), total };
  }
  const rate = patterns.holdTendency;
  return { similar: Math.max(1, Math.round(rate * total)), total };
}

function priceMovePhrase(changePercent: number): string {
  const abs = Math.abs(changePercent).toFixed(1);
  if (changePercent >= 3) return `after a +${abs}% price move`;
  if (changePercent <= -3) return `after a ${changePercent.toFixed(1)}% price drop`;
  return `in a ±${abs}% price environment`;
}

function evidenceForReason(dna: TradingDNA, reasonCode: TwinReasonCode): string {
  const dnaId = REASON_TO_DNA[reasonCode];
  if (dnaId) {
    const score = getDNAScore(dna, dnaId);
    if (score?.evidence[0]) return score.evidence[0];
  }
  return REASON_EXPLANATIONS[reasonCode] ?? "Based on your measured on-chain behaviour.";
}

function buildTwinActionLine(
  twinDecision: TradeSide,
  marketChangePercent: number,
  twin: TwinProfile,
): string {
  const { similar, total } = similarHistoricalCount(
    twinDecision,
    marketChangePercent,
    twin,
  );
  const move = priceMovePhrase(marketChangePercent);
  return `Your Twin chose ${twinDecision} — in ${similar} of ${total} comparable past situations, you ${twinDecision === "BUY" ? "bought" : twinDecision === "SELL" ? "sold" : "held"} ${move}`;
}

function buildPatternLine(
  matched: boolean,
  brokeCountInSession: number,
  patternLabel: string,
): string {
  if (matched) {
    return `This matches your usual ${patternLabel} pattern from on-chain history.`;
  }
  if (brokeCountInSession <= 1) {
    return `This is the first time you've broken your typical ${patternLabel} pattern in this simulation.`;
  }
  return `This is the ${ordinal(brokeCountInSession)} time you've broken your typical ${patternLabel} pattern in this simulation.`;
}

/**
 * Presentation-only explainer — reads existing round/twin/DNA data; does not alter simulation logic.
 */
export function buildWhyWeDiffered(
  record: RoundRecord,
  twin: TwinProfile,
  dna: TradingDNA,
  brokeCountInSession: number,
): WhyWeDifferedExplanation | null {
  if (!record.divergence.diverged) return null;

  const reasonCode = primaryReasonCode(record.twinResult.reasonCodes);
  const patternLabel = PATTERN_LABELS[reasonCode] ?? "behavioural";
  const matchedHistoricalPattern = record.userDecision === record.twinDecision;

  return {
    roundId: record.roundId,
    diverged: true,
    userDecision: record.userDecision,
    twinDecision: record.twinDecision,
    userActionLine: `You chose ${record.userDecision}`,
    twinActionLine: buildTwinActionLine(
      record.twinDecision,
      record.market.changePercent,
      twin,
    ),
    patternLine: buildPatternLine(
      matchedHistoricalPattern,
      brokeCountInSession,
      patternLabel,
    ),
    dominantPatternLabel: patternLabel,
    matchedHistoricalPattern,
    evidenceSnippet: evidenceForReason(dna, reasonCode),
    twinRationale: record.twinResult.explanation,
  };
}

export function buildBehavioralSessionSummary(
  rounds: RoundRecord[],
  dna: TradingDNA,
): BehavioralSessionSummary {
  const totalRounds = rounds.length;
  const divergedRounds = rounds.filter((r) => r.divergence.diverged).length;
  const alignedRounds = totalRounds - divergedRounds;
  const matchedPatternRounds = alignedRounds;
  const brokePatternRounds = divergedRounds;

  const detailLines: string[] = [];

  if (totalRounds === 0) {
    return {
      totalRounds: 0,
      alignedRounds: 0,
      divergedRounds: 0,
      matchedPatternRounds: 0,
      brokePatternRounds: 0,
      headline: "No rounds completed in this session.",
      detailLines: [],
    };
  }

  detailLines.push(
    `You matched your historical pattern in ${matchedPatternRounds} of ${totalRounds} round${totalRounds === 1 ? "" : "s"}.`,
  );

  if (brokePatternRounds > 0) {
    detailLines.push(
      `You broke from your Twin's model (your on-chain behavioural baseline) in ${brokePatternRounds} round${brokePatternRounds === 1 ? "" : "s"}.`,
    );
  } else {
    detailLines.push(
      "Every decision aligned with what your Twin would have done from your on-chain history.",
    );
  }

  const dominantBreaks = rounds
    .filter((r) => r.divergence.diverged)
    .map((r) => primaryReasonCode(r.twinResult.reasonCodes));

  if (dominantBreaks.length > 0) {
    const top = dominantBreaks[0];
    const label = PATTERN_LABELS[top] ?? "behavioural";
    const evidence = evidenceForReason(dna, top);
    detailLines.push(`Most common divergence context: ${label} — ${evidence}`);
  }

  const headline =
    brokePatternRounds === 0
      ? "You stayed true to your historical trading DNA throughout this replay."
      : brokePatternRounds >= totalRounds / 2
        ? "You frequently deviated from your own on-chain patterns this session."
        : "You mixed instinct with habit — some rounds matched your DNA, others broke it.";

  return {
    totalRounds,
    alignedRounds,
    divergedRounds,
    matchedPatternRounds,
    brokePatternRounds,
    headline,
    detailLines,
  };
}
