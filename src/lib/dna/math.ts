export function clampScore(value: number): number {
  return Math.round(Math.max(0, Math.min(100, value)));
}

/** Map `value` linearly so `atLow` → 0 and `atHigh` → 100. */
export function linearScale(value: number, atLow: number, atHigh: number): number {
  if (atHigh === atLow) return 50;
  return clampScore(((value - atLow) / (atHigh - atLow)) * 100);
}

export function combineConfidence(...values: number[]): number {
  if (values.length === 0) return 0;
  const product = values.reduce((acc, v) => acc * Math.max(0, Math.min(1, v)), 1);
  return Math.round(product ** (1 / values.length) * 100) / 100;
}

export function isLowConfidence(
  insufficientFlags: boolean[],
  confidences: number[],
): boolean {
  if (insufficientFlags.some(Boolean)) return true;
  return combineConfidence(...confidences) < 0.5;
}
