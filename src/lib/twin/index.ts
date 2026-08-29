export { buildTwinProfile, TWIN_VERSION } from "./profile";
export { normalizeTwinProfile } from "./normalize";
export { computeTwinDecision, buildSimulationState } from "./engine";
export { explainReasonCodes, REASON_EXPLANATIONS } from "./reasons";
export type {
  TwinProfile,
  TwinDecisionResult,
  SimulationState,
  TwinWeights,
  TwinHistoricalPatterns,
  TwinReasonCode,
} from "./types";
