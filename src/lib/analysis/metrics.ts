import type { ClosedPosition, Trade } from "./types";
import { metricResult } from "./confidence";
import { matchPositions } from "./positions";

const MS_PER_DAY = 86_400_000;
const MS_PER_HOUR = 3_600_000;
const MS_PER_WEEK = 7 * MS_PER_DAY;

export function analyzeTradingFrequency(trades: Trade[]) {
  if (trades.length === 0) {
    return metricResult(0, 0, "Trades per day", "trades/day", 1);
  }

  const timestamps = trades.map((t) => t.timestamp);
  const spanMs = Math.max(1, Math.max(...timestamps) - Math.min(...timestamps));
  const spanDays = spanMs / MS_PER_DAY;
  const tradesPerDay = trades.length / Math.max(spanDays, 1);

  return metricResult(tradesPerDay, trades.length, "Trades per day", "trades/day", 3);
}

export function analyzeAverageHoldingTime(closed: ClosedPosition[]) {
  if (closed.length === 0) {
    return metricResult(0, 0, "Average holding time", "hours", 1);
  }

  const avgMs =
    closed.reduce((sum, p) => sum + p.holdTimeMs, 0) / closed.length;
  return metricResult(
    avgMs / MS_PER_HOUR,
    closed.length,
    "Average holding time",
    "hours",
    3,
  );
}

export function analyzeWinRate(closed: ClosedPosition[]) {
  if (closed.length === 0) {
    return metricResult(0, 0, "Win rate", "%", 1);
  }

  const wins = closed.filter((p) => p.pnl > 0).length;
  return metricResult(
    (wins / closed.length) * 100,
    closed.length,
    "Win rate",
    "%",
    3,
  );
}

export function analyzeAverageWinningTrade(closed: ClosedPosition[]) {
  const winners = closed.filter((p) => p.pnl > 0);
  if (winners.length === 0) {
    return metricResult(0, 0, "Average winning trade", "USD", 1);
  }

  const avg = winners.reduce((s, p) => s + p.pnl, 0) / winners.length;
  return metricResult(avg, winners.length, "Average winning trade", "USD", 1);
}

export function analyzeAverageLosingTrade(closed: ClosedPosition[]) {
  const losers = closed.filter((p) => p.pnl < 0);
  if (losers.length === 0) {
    return metricResult(0, 0, "Average losing trade", "USD", 1);
  }

  const avg = losers.reduce((s, p) => s + p.pnl, 0) / losers.length;
  return metricResult(avg, losers.length, "Average losing trade", "USD", 1);
}

export function analyzePositionSize(trades: Trade[]) {
  const buys = trades.filter((t) => t.side === "BUY");
  if (buys.length === 0) {
    const empty = metricResult(0, 0, "Average position size", "% portfolio", 1);
    return {
      averagePositionSizePct: empty,
      maxPositionSizePct: empty,
      positionSizeStdDev: empty,
    };
  }

  const notionals = buys.map((t) => t.amount * t.price);
  const totalNotional = notionals.reduce((s, n) => s + n, 0);
  const pcts = notionals.map((n) => (n / totalNotional) * 100);
  const avg = pcts.reduce((s, p) => s + p, 0) / pcts.length;
  const max = Math.max(...pcts);
  const variance =
    pcts.reduce((s, p) => s + (p - avg) ** 2, 0) / pcts.length;

  return {
    averagePositionSizePct: metricResult(
      avg,
      buys.length,
      "Average position size",
      "% portfolio",
      3,
    ),
    maxPositionSizePct: metricResult(
      max,
      buys.length,
      "Max position size",
      "% portfolio",
      3,
    ),
    positionSizeStdDev: metricResult(
      Math.sqrt(variance),
      buys.length,
      "Position size variance",
      "std dev %",
      3,
    ),
  };
}

export function analyzeEntryAfterPump(trades: Trade[], pumpThresholdPct = 10) {
  const buys = trades.filter((t) => t.side === "BUY");
  if (buys.length === 0) {
    const empty = metricResult(0, 0, "Entry after pump", "%", 1);
    return {
      frequency: empty,
      averageLagHours: metricResult(0, 0, "Avg lag after pump", "hours", 1),
      pumpThresholdPct,
    };
  }

  const priceByToken = new Map<string, { price: number; timestamp: number }[]>();

  let pumpEntries = 0;
  let comparable = 0;
  let totalLagHours = 0;

  for (const trade of [...trades].sort((a, b) => a.timestamp - b.timestamp)) {
    const history = priceByToken.get(trade.token) ?? [];
    history.push({ price: trade.price, timestamp: trade.timestamp });
    priceByToken.set(trade.token, history);

    if (trade.side !== "BUY" || history.length < 2) continue;

    const prior = history.slice(0, -1);
    const minPrior = Math.min(...prior.map((p) => p.price));
    if (minPrior <= 0) continue;

    const pumpPct = ((trade.price - minPrior) / minPrior) * 100;
    comparable++;

    if (pumpPct >= pumpThresholdPct) {
      pumpEntries++;
      const pumpPoint = prior.find(
        (p) => ((trade.price - p.price) / p.price) * 100 >= pumpThresholdPct,
      );
      if (pumpPoint) {
        totalLagHours += (trade.timestamp - pumpPoint.timestamp) / MS_PER_HOUR;
      }
    }
  }

  return {
    frequency: metricResult(
      comparable > 0 ? (pumpEntries / comparable) * 100 : 0,
      comparable,
      "Entry after pump",
      "%",
      3,
    ),
    averageLagHours: metricResult(
      pumpEntries > 0 ? totalLagHours / pumpEntries : 0,
      pumpEntries,
      "Avg lag after pump",
      "hours",
      1,
    ),
    pumpThresholdPct,
  };
}

export function analyzeTradingAfterLoss(trades: Trade[]) {
  if (trades.length === 0) {
    const empty = metricResult(0, 0, "Post-loss frequency multiplier", "×", 1);
    return {
      frequencyMultiplier: empty,
      rebuyWithin24hRate: metricResult(0, 0, "Rebuy within 24h after loss", "%", 1),
    };
  }

  const dailyPnl = new Map<string, number>();
  const dailyCount = new Map<string, number>();

  for (const trade of trades) {
    const day = new Date(trade.timestamp).toISOString().slice(0, 10);
    dailyCount.set(day, (dailyCount.get(day) ?? 0) + 1);
    if (trade.pnl !== undefined) {
      dailyPnl.set(day, (dailyPnl.get(day) ?? 0) + trade.pnl);
    }
  }

  const days = [...dailyCount.keys()].sort();
  let lossDayTrades = 0;
  let lossDayCount = 0;
  let normalDayTrades = 0;
  let normalDayCount = 0;
  let rebuyAfterLoss = 0;
  let lossDaysWithRebuy = 0;

  for (let i = 0; i < days.length - 1; i++) {
    const day = days[i];
    const nextDay = days[i + 1];
    const pnl = dailyPnl.get(day) ?? 0;
    const count = dailyCount.get(day) ?? 0;
    const nextCount = dailyCount.get(nextDay) ?? 0;

    const dayMs = new Date(day).getTime();
    const nextMs = new Date(nextDay).getTime();

    if (pnl < 0) {
      lossDayTrades += count;
      lossDayCount++;
      if (nextMs - dayMs <= MS_PER_DAY * 1.5) {
        lossDaysWithRebuy++;
        rebuyAfterLoss += nextCount;
      }
    } else {
      normalDayTrades += count;
      normalDayCount++;
    }
  }

  const avgLossDay = lossDayCount > 0 ? lossDayTrades / lossDayCount : 0;
  const avgNormalDay = normalDayCount > 0 ? normalDayTrades / normalDayCount : 0;
  const multiplier = avgNormalDay > 0 ? avgLossDay / avgNormalDay : 0;

  return {
    frequencyMultiplier: metricResult(
      multiplier,
      lossDayCount,
      "Post-loss frequency multiplier",
      "×",
      2,
    ),
    rebuyWithin24hRate: metricResult(
      lossDayCount > 0 ? (lossDaysWithRebuy / lossDayCount) * 100 : 0,
      lossDayCount,
      "Rebuy within 24h after loss",
      "%",
      2,
    ),
  };
}

export function analyzeEarlyExit(closed: ClosedPosition[]) {
  const winners = closed.filter((p) => p.pnl > 0);
  const losers = closed.filter((p) => p.pnl < 0);

  const avgWinnerHold =
    winners.length > 0
      ? winners.reduce((s, p) => s + p.holdTimeMs, 0) / winners.length / MS_PER_HOUR
      : 0;
  const avgLoserHold =
    losers.length > 0
      ? losers.reduce((s, p) => s + p.holdTimeMs, 0) / losers.length / MS_PER_HOUR
      : 0;

  const holdRatio = avgWinnerHold > 0 ? avgLoserHold / avgWinnerHold : 0;

  const medianHold =
    closed.length > 0
      ? [...closed].sort((a, b) => a.holdTimeMs - b.holdTimeMs)[
          Math.floor(closed.length / 2)
        ].holdTimeMs
      : 0;

  const earlyWinners = winners.filter((p) => p.holdTimeMs < medianHold).length;

  return {
    avgWinnerHoldHours: metricResult(
      avgWinnerHold,
      winners.length,
      "Avg winner hold time",
      "hours",
      2,
    ),
    avgLoserHoldHours: metricResult(
      avgLoserHold,
      losers.length,
      "Avg loser hold time",
      "hours",
      2,
    ),
    holdTimeRatio: metricResult(
      holdRatio,
      closed.length,
      "Loser/winner hold ratio",
      "×",
      2,
    ),
    earlyWinnerExitRate: metricResult(
      winners.length > 0 ? (earlyWinners / winners.length) * 100 : 0,
      winners.length,
      "Early winner exit rate",
      "%",
      2,
    ),
  };
}

export function analyzeOvertrading(trades: Trade[]) {
  if (trades.length === 0) {
    const empty = metricResult(0, 0, "Trades per week", "trades/week", 1);
    return {
      tradesPerWeek: empty,
      peakWeekTrades: empty,
      peakToAverageRatio: empty,
      burstAfterLossDays: metricResult(0, 0, "Burst after loss days", "×", 1),
    };
  }

  const weeklyCount = new Map<string, number>();
  const dailyPnl = new Map<string, number>();

  for (const trade of trades) {
    const date = new Date(trade.timestamp);
    const weekKey = `${date.getUTCFullYear()}-W${Math.ceil(
      ((date.getTime() - new Date(date.getUTCFullYear(), 0, 1).getTime()) / MS_PER_DAY + 1) / 7,
    )}`;
    weeklyCount.set(weekKey, (weeklyCount.get(weekKey) ?? 0) + 1);

    const day = date.toISOString().slice(0, 10);
    if (trade.pnl !== undefined) {
      dailyPnl.set(day, (dailyPnl.get(day) ?? 0) + trade.pnl);
    }
  }

  const counts = [...weeklyCount.values()];
  const avg = counts.reduce((s, c) => s + c, 0) / counts.length;
  const peak = Math.max(...counts);
  const ratio = avg > 0 ? peak / avg : 0;

  const days = [...dailyPnl.keys()].sort();
  let burstSum = 0;
  let burstSamples = 0;

  for (let i = 0; i < days.length - 1; i++) {
    if ((dailyPnl.get(days[i]) ?? 0) < 0) {
      const nextDay = days[i + 1];
      const dayMs = new Date(days[i]).getTime();
      const nextMs = new Date(nextDay).getTime();
      if (nextMs - dayMs <= MS_PER_DAY * 1.5) {
        burstSum += ratio;
        burstSamples++;
      }
    }
  }

  return {
    tradesPerWeek: metricResult(avg, counts.length, "Trades per week", "trades/week", 2),
    peakWeekTrades: metricResult(peak, counts.length, "Peak week trades", "trades", 2),
    peakToAverageRatio: metricResult(ratio, counts.length, "Peak/average ratio", "×", 2),
    burstAfterLossDays: metricResult(
      burstSamples > 0 ? burstSum / burstSamples : 0,
      burstSamples,
      "Burst after loss days",
      "×",
      2,
    ),
  };
}

export { matchPositions };
