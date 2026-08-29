import type { TwinProfile } from "./types";

/** Ensures cached/API twins have fields added in newer app versions. */
export function normalizeTwinProfile(twin: TwinProfile): TwinProfile {
  const tradeCount = twin.tradeCount ?? 0;
  return {
    ...twin,
    tradeCount,
    lowDataMode: twin.lowDataMode ?? tradeCount < 3,
    baselineProbabilities: twin.baselineProbabilities ?? {
      buy: 0.33,
      hold: 0.34,
      sell: 0.33,
    },
  };
}
