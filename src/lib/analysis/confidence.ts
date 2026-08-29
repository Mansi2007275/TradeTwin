import type { MetricResult } from "./types";

const MIN_TRADES_LOW = 5;
const MIN_TRADES_MEDIUM = 15;
const MIN_TRADES_HIGH = 30;

export function tradeConfidence(sampleSize: number): number {
  if (sampleSize < MIN_TRADES_LOW) {
    return Math.max(0.1, (sampleSize / MIN_TRADES_LOW) * 0.4);
  }
  if (sampleSize < MIN_TRADES_MEDIUM) {
    return 0.4 + ((sampleSize - MIN_TRADES_LOW) / (MIN_TRADES_MEDIUM - MIN_TRADES_LOW)) * 0.3;
  }
  if (sampleSize < MIN_TRADES_HIGH) {
    return 0.7 + ((sampleSize - MIN_TRADES_MEDIUM) / (MIN_TRADES_HIGH - MIN_TRADES_MEDIUM)) * 0.2;
  }
  return Math.min(0.95, 0.9 + (sampleSize - MIN_TRADES_HIGH) * 0.001);
}

export function metricResult(
  value: number,
  sampleSize: number,
  label: string,
  unit?: string,
  minSample = 3,
): MetricResult {
  return {
    value,
    confidence: tradeConfidence(sampleSize),
    sampleSize,
    insufficientData: sampleSize < minSample,
    label,
    unit,
  };
}
