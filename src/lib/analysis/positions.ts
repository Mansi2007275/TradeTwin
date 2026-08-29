import type { ClosedPosition, Trade } from "./types";

interface OpenLot {
  amount: number;
  price: number;
  timestamp: number;
}

export function matchPositions(trades: Trade[]): ClosedPosition[] {
  const sorted = [...trades].sort((a, b) => a.timestamp - b.timestamp);
  const openLots = new Map<string, OpenLot[]>();
  const closed: ClosedPosition[] = [];

  for (const trade of sorted) {
    const lots = openLots.get(trade.token) ?? [];

    if (trade.side === "BUY") {
      lots.push({
        amount: trade.amount,
        price: trade.price,
        timestamp: trade.timestamp,
      });
      openLots.set(trade.token, lots);
      continue;
    }

    let remaining = trade.amount;
    while (remaining > 0 && lots.length > 0) {
      const lot = lots[0];
      const matched = Math.min(remaining, lot.amount);
      const pnl = (trade.price - lot.price) * matched;

      closed.push({
        token: trade.token,
        entryTimestamp: lot.timestamp,
        exitTimestamp: trade.timestamp,
        holdTimeMs: trade.timestamp - lot.timestamp,
        pnl,
        entryPrice: lot.price,
        exitPrice: trade.price,
        amount: matched,
      });

      lot.amount -= matched;
      remaining -= matched;
      if (lot.amount <= 1e-12) lots.shift();
    }
    openLots.set(trade.token, lots);
  }

  return closed;
}

export function assignTradePnl(trades: Trade[]): Trade[] {
  const sorted = [...trades].sort((a, b) => a.timestamp - b.timestamp);
  const openLots = new Map<string, OpenLot[]>();

  return sorted.map((trade) => {
    if (trade.side === "BUY") {
      const lots = openLots.get(trade.token) ?? [];
      lots.push({
        amount: trade.amount,
        price: trade.price,
        timestamp: trade.timestamp,
      });
      openLots.set(trade.token, lots);
      return trade;
    }

    const lots = openLots.get(trade.token) ?? [];
    let remaining = trade.amount;
    let totalPnl = 0;

    while (remaining > 0 && lots.length > 0) {
      const lot = lots[0];
      const matched = Math.min(remaining, lot.amount);
      totalPnl += (trade.price - lot.price) * matched;
      lot.amount -= matched;
      remaining -= matched;
      if (lot.amount <= 1e-12) lots.shift();
    }
    openLots.set(trade.token, lots);

    return { ...trade, pnl: totalPnl };
  });
}
