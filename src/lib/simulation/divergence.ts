import type { TradeSide } from "@/lib/types";
import type { TwinDecisionResult } from "@/lib/twin/types";
import type { DivergenceAnalysis } from "./types";

const DIVERGENCE_REASONS: Record<string, string> = {
  USER_BUY_TWIN_SELL:
    "You bought while your Twin sold — your Twin mirrored a defensive exit pattern from your history.",
  USER_SELL_TWIN_BUY:
    "You sold while your Twin bought — your Twin chased an entry pattern you typically follow after pumps.",
  USER_HOLD_TWIN_BUY:
    "You held while your Twin bought — your Twin activated a momentum-entry habit you often display.",
  USER_HOLD_TWIN_SELL:
    "You held while your Twin sold — your Twin mirrored your tendency to exit early on uncertainty.",
  USER_BUY_TWIN_HOLD:
    "You bought while your Twin waited — you were more aggressive than your historical baseline this round.",
  USER_SELL_TWIN_HOLD:
    "You sold while your Twin held — you de-risked faster than your Twin's behavioural model.",
};

function divergenceKey(user: TradeSide, twin: TradeSide): string {
  return `USER_${user}_TWIN_${twin}`;
}

export function analyzeDivergence(
  userDecision: TradeSide,
  twinDecision: TradeSide,
  twinResult: TwinDecisionResult,
): DivergenceAnalysis {
  if (userDecision === twinDecision) {
    return {
      diverged: false,
      codes: ["ALIGNED"],
      reasons: [
        "You and your Twin made the same decision this round.",
        twinResult.explanation,
      ],
    };
  }

  const key = divergenceKey(userDecision, twinDecision);
  const reasons = [DIVERGENCE_REASONS[key] ?? "You and your Twin diverged on this round."];
  reasons.push(`Twin rationale: ${twinResult.explanation}`);

  return {
    diverged: true,
    codes: [key, ...twinResult.reasonCodes],
    reasons,
  };
}
