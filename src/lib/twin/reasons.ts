import type { TwinReasonCode } from "./types";

export const REASON_EXPLANATIONS: Record<TwinReasonCode, string> = {
  BASELINE_BEHAVIOUR:
    "Decision anchored to your historical buy/hold/sell frequency.",
  MOMENTUM_PUMP_ENTRY:
    "Price is rising — your history shows buying into momentum after pumps.",
  FOMO_CHASE:
    "Sharp price move triggered your documented FOMO entry pattern.",
  REACTIVE_SELL_AFTER_LOSSES:
    "Consecutive losses — your twin mirrors reactive selling behaviour.",
  OVERTRADE_AFTER_LOSS:
    "Previous loss — your history shows increased trading activity after setbacks.",
  EARLY_WINNER_EXIT:
    "In profit with low patience score — twin exits winners early, matching your pattern.",
  HOLD_LOSER:
    "Underwater position — twin holds losers longer, matching your hold-time imbalance.",
  HIGH_EXPOSURE_CAUTION:
    "Position already large relative to your average — twin avoids adding risk.",
  AGGRESSIVE_SIZE_UP:
    "High risk tendency with room to add — twin sizes up like your historical behaviour.",
  HIGH_VOLATILITY_HOLD:
    "Elevated volatility — twin defaults to holding, reflecting cautious periods in your data.",
  TREND_CONTINUATION_HOLD:
    "Moderate uptrend with open position — twin holds through trend, matching your style.",
  NO_POSITION_WAIT:
    "No open position and weak signal — twin waits rather than forcing a trade.",
};

export function explainReasonCodes(codes: string[]): string {
  if (codes.length === 0) {
    return "Twin decision based on your baseline historical behaviour.";
  }

  const explanations = codes
    .map((code) => REASON_EXPLANATIONS[code as TwinReasonCode])
    .filter(Boolean);

  if (explanations.length === 0) {
    return "Twin decision reflects your measured behavioural patterns.";
  }

  return explanations.join(" ");
}
