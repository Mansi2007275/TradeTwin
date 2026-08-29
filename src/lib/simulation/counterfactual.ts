import type { TradeSide } from "@/lib/types";
import type { RoundRecord } from "./types";
import {
  applyDecisionVariant,
  createPortfolio,
  portfolioValue,
  type DecisionVariant,
} from "./portfolio";

export interface CounterfactualAlternative {
  label: string;
  variant: DecisionVariant;
  decision: string;
  roundValueAfter: number;
  roundPnL: number;
  diffFromActualRound: number;
  finalPortfolioValue: number;
  finalReturnPct: number;
  diffFromActualFinal: number;
  maxDrawdownPct: number | null;
}

export interface RoundCounterfactual {
  roundId: number;
  actualDecision: TradeSide;
  actualRoundPnL: number;
  actualFinalValue: number;
  portfolioBefore: number;
  marketPrice: number;
  alternatives: CounterfactualAlternative[];
}

export interface WhatIfAnalysis {
  disclaimer: string;
  rounds: RoundCounterfactual[];
  initialBalance: number;
}

import { INITIAL_PORTFOLIO } from "./types";

function computeMaxDrawdown(values: number[]): number | null {
  if (values.length < 2) return null;

  let peak = values[0];
  let maxDrawdown = 0;

  for (const value of values) {
    if (value > peak) peak = value;
    if (peak > 0) {
      const dd = ((peak - value) / peak) * 100;
      if (dd > maxDrawdown) maxDrawdown = dd;
    }
  }

  return Math.round(maxDrawdown * 100) / 100;
}

function replayWithOverride(
  rounds: RoundRecord[],
  overrideIndex: number,
  overrideVariant: DecisionVariant,
): { roundValueAfter: number; finalValue: number; pathValues: number[] } {
  let portfolio = createPortfolio(INITIAL_PORTFOLIO);
  const pathValues: number[] = [];

  for (let i = 0; i < rounds.length; i++) {
    const price = rounds[i].market.price;
    const variant =
      i === overrideIndex ? overrideVariant : rounds[i].userDecision;

    portfolio = applyDecisionVariant(portfolio, variant, price);
    pathValues.push(portfolioValue(portfolio, price));
  }

  return {
    roundValueAfter: pathValues[overrideIndex],
    finalValue: pathValues[pathValues.length - 1],
    pathValues,
  };
}

function getAlternativesForRound(
  rounds: RoundRecord[],
  roundIndex: number,
  actualFinalValue: number,
): CounterfactualAlternative[] {
  const round = rounds[roundIndex];
  const portfolioBefore = round.userPortfolioBefore;
  const actualRoundAfter = round.userPortfolioAfter;

  const variants: { label: string; variant: DecisionVariant }[] = [
    { label: "BUY alternative", variant: "BUY" },
    { label: "HOLD alternative", variant: "HOLD" },
    { label: "SELL alternative", variant: "SELL" },
    { label: "Half-position BUY", variant: "HALF_BUY" },
    { label: "Half-position SELL", variant: "HALF_SELL" },
  ];

  return variants.map(({ label, variant }) => {
    const { roundValueAfter, finalValue, pathValues } = replayWithOverride(
      rounds,
      roundIndex,
      variant,
    );

    const roundPnL = roundValueAfter - portfolioBefore;
    const pathFromRound = pathValues.slice(roundIndex);
    const maxDrawdownPct = computeMaxDrawdown(pathFromRound);

    return {
      label,
      variant,
      decision: variant.replace("_", " "),
      roundValueAfter,
      roundPnL,
      diffFromActualRound: roundValueAfter - actualRoundAfter,
      finalPortfolioValue: finalValue,
      finalReturnPct:
        ((finalValue - INITIAL_PORTFOLIO) / INITIAL_PORTFOLIO) * 100,
      diffFromActualFinal: finalValue - actualFinalValue,
      maxDrawdownPct,
    };
  });
}

export function computeWhatIfAnalysis(
  rounds: RoundRecord[],
  actualFinalValue: number,
): WhatIfAnalysis {
  const roundAnalyses: RoundCounterfactual[] = rounds.map((round, index) => ({
    roundId: round.roundId,
    actualDecision: round.userDecision,
    actualRoundPnL: round.userPortfolioAfter - round.userPortfolioBefore,
    actualFinalValue,
    portfolioBefore: round.userPortfolioBefore,
    marketPrice: round.market.price,
    alternatives: getAlternativesForRound(rounds, index, actualFinalValue),
  }));

  return {
    disclaimer:
      "Historical simulation / counterfactual analysis only. These results replay past market data with alternative decisions — they are not predictions of future performance.",
    rounds: roundAnalyses,
    initialBalance: INITIAL_PORTFOLIO,
  };
}
