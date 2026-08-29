export {
  createSimulationSession,
  processRound,
  finalizeSimulation,
  getDisplayedPortfolios,
  INITIAL_PORTFOLIO,
  SIMULATION_ROUNDS,
} from "./engine";
export { computeWhatIfAnalysis } from "./counterfactual";
export type {
  WhatIfAnalysis,
  RoundCounterfactual,
  CounterfactualAlternative,
} from "./counterfactual";
export { getMarketForRound, hasSimulationMarketsLoaded, setSimulationMarketRounds } from "./market-data";
export type {
  SimulationSession,
  SimulationOutcome,
  RoundRecord,
  DivergenceAnalysis,
} from "./types";
