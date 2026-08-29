import type { BehaviourProfile } from "@/lib/analysis/types";
import type { DNAScoreResult } from "./types";
import {
  clampScore,
  combineConfidence,
  isLowConfidence,
  linearScale,
} from "./math";

function scoreFomo(p: BehaviourProfile): DNAScoreResult {
  const pumpFreq = p.entryAfterPump.frequency;
  const lag = p.entryAfterPump.averageLagHours;
  const threshold = p.entryAfterPump.pumpThresholdPct;

  const lagImpatience = clampScore(Math.max(0, 100 - lag.value * 4.17));
  const score = clampScore(0.65 * pumpFreq.value + 0.35 * lagImpatience);

  const confidences = [pumpFreq.confidence, lag.confidence];
  const insufficient = [pumpFreq.insufficientData, lag.insufficientData];

  return {
    id: "fomo",
    label: "FOMO Score",
    score,
    confidence: combineConfidence(...confidences),
    lowConfidence: isLowConfidence(insufficient, confidences),
    formula: `0.65 × pumpEntryRate + 0.35 × lagImpatience, where lagImpatience = max(0, 100 − avgLagHours × 4.17)`,
    evidence: [
      `${pumpFreq.value.toFixed(1)}% of buys occurred after ≥${threshold}% price pump (n=${pumpFreq.sampleSize})`,
      `Average entry lag after pump: ${lag.value.toFixed(1)} hours`,
      `Lag impatience component: ${lagImpatience}/100`,
    ],
    inputs: {
      pumpEntryRate: pumpFreq.value,
      avgLagHours: lag.value,
      lagImpatience,
      pumpThresholdPct: threshold,
    },
  };
}

function scoreRisk(p: BehaviourProfile): DNAScoreResult {
  const avg = p.positionSizeBehaviour.averagePositionSizePct;
  const max = p.positionSizeBehaviour.maxPositionSizePct;
  const std = p.positionSizeBehaviour.positionSizeStdDev;

  const avgComponent = linearScale(avg.value, 5, 35);
  const maxComponent = linearScale(max.value, 10, 50);
  const stdComponent = linearScale(std.value, 2, 15);
  const score = clampScore(0.35 * avgComponent + 0.45 * maxComponent + 0.2 * stdComponent);

  const confidences = [avg.confidence, max.confidence, std.confidence];
  const insufficient = [avg.insufficientData, max.insufficientData, std.insufficientData];

  return {
    id: "risk",
    label: "Risk Score",
    score,
    confidence: combineConfidence(...confidences),
    lowConfidence: isLowConfidence(insufficient, confidences),
    formula: `0.35 × scale(avgPosition%) + 0.45 × scale(maxPosition%) + 0.20 × scale(positionStdDev)`,
    evidence: [
      `Average position size: ${avg.value.toFixed(1)}% of portfolio (n=${avg.sampleSize})`,
      `Max single position: ${max.value.toFixed(1)}% of portfolio`,
      `Position size std dev: ${std.value.toFixed(1)}%`,
    ],
    inputs: {
      avgPositionPct: avg.value,
      maxPositionPct: max.value,
      positionStdDev: std.value,
    },
  };
}

function scorePatience(p: BehaviourProfile): DNAScoreResult {
  const holdRatio = p.earlyExit.holdTimeRatio;
  const earlyExit = p.earlyExit.earlyWinnerExitRate;
  const avgWin = p.earlyExit.avgWinnerHoldHours;
  const avgLoss = p.earlyExit.avgLoserHoldHours;

  const ratioImpatience = linearScale(holdRatio.value, 1, 3);
  const exitImpatience = earlyExit.value;
  const impatience = clampScore(0.5 * ratioImpatience + 0.5 * exitImpatience);
  const score = clampScore(100 - impatience);

  const confidences = [holdRatio.confidence, earlyExit.confidence];
  const insufficient = [holdRatio.insufficientData, earlyExit.insufficientData];

  return {
    id: "patience",
    label: "Patience Score",
    score,
    confidence: combineConfidence(...confidences),
    lowConfidence: isLowConfidence(insufficient, confidences),
    formula: `100 − (0.5 × scale(loser/winnerHoldRatio, 1→3) + 0.5 × earlyWinnerExitRate)`,
    evidence: [
      `Loser/winner hold ratio: ${holdRatio.value.toFixed(2)}× (n=${holdRatio.sampleSize})`,
      `Early winner exit rate: ${earlyExit.value.toFixed(1)}%`,
      `Avg winner hold: ${avgWin.value.toFixed(1)}h · Avg loser hold: ${avgLoss.value.toFixed(1)}h`,
    ],
    inputs: {
      holdTimeRatio: holdRatio.value,
      earlyWinnerExitRate: earlyExit.value,
      avgWinnerHoldHours: avgWin.value,
      avgLoserHoldHours: avgLoss.value,
      impatience,
    },
  };
}

function scoreMomentum(p: BehaviourProfile): DNAScoreResult {
  const pumpFreq = p.entryAfterPump.frequency;
  const earlyExit = p.earlyExit.earlyWinnerExitRate;
  const winRate = p.winRate;

  const trendHold = clampScore(100 - earlyExit.value);
  const score = clampScore(
    0.45 * pumpFreq.value + 0.35 * trendHold + 0.2 * winRate.value,
  );

  const confidences = [pumpFreq.confidence, earlyExit.confidence, winRate.confidence];
  const insufficient = [
    pumpFreq.insufficientData,
    earlyExit.insufficientData,
    winRate.insufficientData,
  ];

  return {
    id: "momentum",
    label: "Momentum Score",
    score,
    confidence: combineConfidence(...confidences),
    lowConfidence: isLowConfidence(insufficient, confidences),
    formula: `0.45 × pumpEntryRate + 0.35 × (100 − earlyWinnerExitRate) + 0.20 × winRate`,
    evidence: [
      `${pumpFreq.value.toFixed(1)}% of entries follow price pumps`,
      `Trend hold component: ${trendHold}/100 (inverse of early exits)`,
      `Win rate: ${winRate.value.toFixed(1)}% across ${winRate.sampleSize} closed positions`,
    ],
    inputs: {
      pumpEntryRate: pumpFreq.value,
      trendHoldComponent: trendHold,
      winRate: winRate.value,
    },
  };
}

function scoreOvertrading(p: BehaviourProfile): DNAScoreResult {
  const tpw = p.overtrading.tradesPerWeek;
  const peakRatio = p.overtrading.peakToAverageRatio;
  const lossMult = p.tradingAfterLoss.frequencyMultiplier;
  const burst = p.overtrading.burstAfterLossDays;

  const freqComponent = linearScale(tpw.value, 3, 25);
  const peakComponent = linearScale(peakRatio.value, 1.2, 3.5);
  const lossComponent = linearScale(lossMult.value, 1, 3);
  const score = clampScore(
    0.4 * freqComponent + 0.35 * peakComponent + 0.25 * lossComponent,
  );

  const confidences = [tpw.confidence, peakRatio.confidence, lossMult.confidence];
  const insufficient = [tpw.insufficientData, peakRatio.insufficientData, lossMult.insufficientData];

  return {
    id: "overtrading",
    label: "Overtrading Score",
    score,
    confidence: combineConfidence(...confidences),
    lowConfidence: isLowConfidence(insufficient, confidences),
    formula: `0.40 × scale(trades/week) + 0.35 × scale(peak/avg week ratio) + 0.25 × scale(post-loss frequency multiplier)`,
    evidence: [
      `Average ${tpw.value.toFixed(1)} trades/week (peak: ${p.overtrading.peakWeekTrades.value.toFixed(0)})`,
      `Peak-to-average week ratio: ${peakRatio.value.toFixed(2)}×`,
      `Post-loss frequency multiplier: ${lossMult.value.toFixed(2)}×`,
      `Burst-after-loss signal: ${burst.value.toFixed(2)}×`,
    ],
    inputs: {
      tradesPerWeek: tpw.value,
      peakToAverageRatio: peakRatio.value,
      postLossMultiplier: lossMult.value,
      burstAfterLoss: burst.value,
    },
  };
}

export function computeDNAScores(profile: BehaviourProfile): DNAScoreResult[] {
  return [
    scoreFomo(profile),
    scoreRisk(profile),
    scorePatience(profile),
    scoreMomentum(profile),
    scoreOvertrading(profile),
  ];
}
