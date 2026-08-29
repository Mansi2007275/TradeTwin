import type { MetricResult } from "@/lib/analysis/types";

export function formatMetricValue(metric: MetricResult): string {
  if (metric.insufficientData) return "—";
  const unit = metric.unit ?? "";
  if (unit === "%") return `${metric.value.toFixed(1)}%`;
  if (unit === "×") return `${metric.value.toFixed(2)}×`;
  if (unit === "USD") return `$${metric.value.toFixed(2)}`;
  if (unit === "hours") return `${metric.value.toFixed(1)}h`;
  if (unit === "trades/day") return `${metric.value.toFixed(2)}/day`;
  if (unit === "trades/week") return `${metric.value.toFixed(1)}/wk`;
  return metric.value.toFixed(2);
}

export function metricSections(profile: import("@/lib/analysis/types").BehaviourProfile) {
  return [
    {
      title: "Core Metrics",
      metrics: [
        profile.tradingFrequency,
        profile.averageHoldingTime,
        profile.winRate,
        profile.averageWinningTrade,
        profile.averageLosingTrade,
      ],
    },
    {
      title: "Position Sizing",
      metrics: [
        profile.positionSizeBehaviour.averagePositionSizePct,
        profile.positionSizeBehaviour.maxPositionSizePct,
        profile.positionSizeBehaviour.positionSizeStdDev,
      ],
    },
    {
      title: "FOMO & Momentum",
      metrics: [
        profile.entryAfterPump.frequency,
        profile.entryAfterPump.averageLagHours,
      ],
    },
    {
      title: "Loss Recovery",
      metrics: [
        profile.tradingAfterLoss.frequencyMultiplier,
        profile.tradingAfterLoss.rebuyWithin24hRate,
      ],
    },
    {
      title: "Exit Behaviour",
      metrics: [
        profile.earlyExit.avgWinnerHoldHours,
        profile.earlyExit.avgLoserHoldHours,
        profile.earlyExit.holdTimeRatio,
        profile.earlyExit.earlyWinnerExitRate,
      ],
    },
    {
      title: "Overtrading",
      metrics: [
        profile.overtrading.tradesPerWeek,
        profile.overtrading.peakWeekTrades,
        profile.overtrading.peakToAverageRatio,
        profile.overtrading.burstAfterLossDays,
      ],
    },
  ];
}
