import type { TwinProfile } from "@/lib/twin/types";
import { buildSimulationState, computeTwinDecision } from "@/lib/twin";
import type { TradeSide } from "@/lib/types";
import type { TwinDecisionResult } from "@/lib/twin/types";
import { analyzeDivergence } from "./divergence";
import {
  getActiveMarketRounds,
  getMarketForRound,
  getVolumeChangePercent,
} from "./market-data";
import {
  applyDecision,
  createPortfolio,
  exposureRatio,
  hasOpenPosition,
  portfolioValue,
  roundOutcome,
} from "./portfolio";
import type {
  RoundRecord,
  SimulationOutcome,
  SimulationSession,
} from "./types";
import { INITIAL_PORTFOLIO, SIMULATION_ROUNDS } from "./types";

export function createSimulationSession(): SimulationSession {
  return {
    id: `sim-${Date.now()}`,
    startedAt: new Date().toISOString(),
    initialBalance: INITIAL_PORTFOLIO,
    currentRound: 0,
    totalRounds: SIMULATION_ROUNDS,
    userPortfolio: createPortfolio(INITIAL_PORTFOLIO),
    twinPortfolio: createPortfolio(INITIAL_PORTFOLIO),
    twinConsecutiveLosses: 0,
    twinLastOutcome: null,
    completedRounds: [],
    status: "active",
  };
}

function buildTwinSimState(session: SimulationSession, roundIndex: number) {
  const market = getMarketForRound(roundIndex);
  const twinPrice = market.price;

  return buildSimulationState({
    round: roundIndex + 1,
    priceChangePercent: market.changePercent,
    volatility: Math.abs(market.changePercent),
    volumeChangePercent: getVolumeChangePercent(roundIndex),
    previousOutcome: session.twinLastOutcome,
    consecutiveLosses: session.twinConsecutiveLosses,
    hasOpenPosition: hasOpenPosition(session.twinPortfolio),
    currentExposure: exposureRatio(session.twinPortfolio, twinPrice),
    positionSizeRelative: 1,
    hoursSinceLastTrade: 24 * (roundIndex + 1),
  });
}

export function processRound(
  session: SimulationSession,
  userDecision: TradeSide,
  twin: TwinProfile,
): { session: SimulationSession; twinResult: TwinDecisionResult; record: RoundRecord } {
  if (session.status !== "active") {
    throw new Error("Simulation is not active");
  }

  const roundIndex = session.currentRound;
  const market = getMarketForRound(roundIndex);
  const price = market.price;

  const userBefore = portfolioValue(session.userPortfolio, price);
  const twinBefore = portfolioValue(session.twinPortfolio, price);

  const twinState = buildTwinSimState(session, roundIndex);
  const twinResult = computeTwinDecision(twin, twinState);
  const twinDecision = twinResult.decision;

  const userPortfolio = applyDecision(session.userPortfolio, userDecision, price);
  const twinPortfolio = applyDecision(session.twinPortfolio, twinDecision, price);

  const userAfter = portfolioValue(userPortfolio, price);
  const twinAfter = portfolioValue(twinPortfolio, price);

  const divergence = analyzeDivergence(userDecision, twinDecision, twinResult);

  const record: RoundRecord = {
    roundId: roundIndex + 1,
    timestamp: new Date().toISOString(),
    market,
    userDecision,
    twinDecision,
    twinResult,
    userPortfolioBefore: userBefore,
    twinPortfolioBefore: twinBefore,
    userPortfolioAfter: userAfter,
    twinPortfolioAfter: twinAfter,
    divergence,
  };

  const twinRoundOutcome = roundOutcome(twinBefore, twinAfter);
  let twinConsecutiveLosses = session.twinConsecutiveLosses;
  if (twinRoundOutcome === "loss") {
    twinConsecutiveLosses += 1;
  } else if (twinRoundOutcome === "win") {
    twinConsecutiveLosses = 0;
  }

  const nextRound = roundIndex + 1;
  const updated: SimulationSession = {
    ...session,
    userPortfolio,
    twinPortfolio,
    twinConsecutiveLosses,
    twinLastOutcome: twinRoundOutcome,
    completedRounds: [...session.completedRounds, record],
    currentRound: nextRound,
    status: nextRound >= SIMULATION_ROUNDS ? "complete" : "active",
  };

  return { session: updated, twinResult, record };
}

export function getDisplayedPortfolios(
  session: SimulationSession,
  roundIndex: number,
  afterDecision: boolean,
): { user: number; twin: number } {
  const market = getMarketForRound(roundIndex);
  const price = market.price;

  if (afterDecision && session.completedRounds[roundIndex]) {
    const r = session.completedRounds[roundIndex];
    return { user: r.userPortfolioAfter, twin: r.twinPortfolioAfter };
  }

  if (roundIndex === 0) {
    return {
      user: portfolioValue(session.userPortfolio, price),
      twin: portfolioValue(session.twinPortfolio, price),
    };
  }

  const prev = session.completedRounds[roundIndex - 1];
  if (prev) {
    return {
      user: portfolioValue(session.userPortfolio, price),
      twin: portfolioValue(session.twinPortfolio, price),
    };
  }

  return { user: INITIAL_PORTFOLIO, twin: INITIAL_PORTFOLIO };
}

export function finalizeSimulation(session: SimulationSession): SimulationOutcome {
  const rounds = getActiveMarketRounds();
  const lastMarket = rounds[rounds.length - 1];
  const finalPrice = lastMarket.price;

  const finalUserValue = portfolioValue(session.userPortfolio, finalPrice);
  const finalTwinValue = portfolioValue(session.twinPortfolio, finalPrice);

  const userReturn = ((finalUserValue - INITIAL_PORTFOLIO) / INITIAL_PORTFOLIO) * 100;
  const twinReturn = ((finalTwinValue - INITIAL_PORTFOLIO) / INITIAL_PORTFOLIO) * 100;

  let winner: "user" | "twin" | "tie" = "tie";
  if (finalUserValue > finalTwinValue + 0.01) winner = "user";
  else if (finalTwinValue > finalUserValue + 0.01) winner = "twin";

  const improvementScore = Math.max(
    0,
    Math.min(100, Math.round(50 + (userReturn - twinReturn) * 5)),
  );

  const divergedRounds = session.completedRounds.filter((r) => r.divergence.diverged);
  const holdWins = session.completedRounds.filter(
    (r) => r.userDecision === "HOLD" && r.userPortfolioAfter > r.userPortfolioBefore,
  );

  let behavioralExplanation: string;
  if (winner === "user") {
    behavioralExplanation =
      divergedRounds.length > 0
        ? `You beat your Twin by ${(userReturn - twinReturn).toFixed(2)}%. Key divergence in ${divergedRounds.length} round(s) — notably when you chose differently on ${holdWins.length > 0 ? "hold decisions that preserved gains" : "entry/exit timing"}.`
        : `You matched your Twin's decisions but ended with a better portfolio value through position timing across ${SIMULATION_ROUNDS} rounds.`;
  } else if (winner === "twin") {
    behavioralExplanation =
      `Your Twin outperformed by ${(twinReturn - userReturn).toFixed(2)}%. Your behavioural model reacted ${divergedRounds.length > 0 ? "differently in " + divergedRounds.length + " round(s)" : "similarly"}, exposing habits that hurt returns in this replay.`;
  } else {
    behavioralExplanation =
      "You and your Twin finished evenly. This historical replay ended in a tie — try different decisions to test your instincts.";
  }

  return {
    userReturn,
    twinReturn,
    winner,
    improvementScore,
    behavioralExplanation,
    rounds: session.completedRounds,
    finalUserValue,
    finalTwinValue,
  };
}

export { INITIAL_PORTFOLIO, SIMULATION_ROUNDS } from "./types";
