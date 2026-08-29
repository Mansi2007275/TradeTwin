import "server-only";

import type { RawTransfer, Trade } from "@/lib/analysis/types";
import { priceDataService } from "@/lib/prices/priceDataService";
import { getPriceAtTimestamp } from "@/lib/prices/price-lookup";
import type { DailyPricePoint } from "@/lib/prices/types";
import { fetchTransfersFromAtlas } from "./fetch-atlas";
import { fetchTransfersFromMonadscan, hasMonadscanApiKey } from "./fetch-monadscan";
import { fetchTransfersFromRpc } from "./fetch-rpc";

export interface WalletTradesResult {
  trades: Trade[];
  source: string;
  transferCount: number;
  priceSource: string;
  transferHint?: string;
}

function enrichTradesWithPrices(trades: Trade[], prices: DailyPricePoint[]): Trade[] {
  return trades.map((trade) => ({
    ...trade,
    price: getPriceAtTimestamp(prices, trade.timestamp),
  }));
}

function mergeTransfers(sources: RawTransfer[][]): RawTransfer[] {
  const seen = new Set<string>();
  const merged: RawTransfer[] = [];

  for (const list of sources) {
    for (const transfer of list) {
      const key = transfer.transactionHash.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(transfer);
    }
  }

  return merged.sort((a, b) => a.timestamp - b.timestamp);
}

export function normalizeTransfers(transfers: RawTransfer[]): Trade[] {
  const sorted = [...transfers].sort((a, b) => a.timestamp - b.timestamp);

  return sorted.map((t) => ({
    transactionHash: t.transactionHash,
    token: t.tokenSymbol || t.token,
    side: t.direction === "in" ? "BUY" : "SELL",
    amount: t.amount,
    price: 1,
    timestamp: t.timestamp,
    gasUsed: t.gasUsed,
  }));
}

export async function fetchWalletTrades(address: string): Promise<WalletTradesResult> {
  const { cache } = await priceDataService.getHistoricalDailyPrices();
  const priceSource = cache.source;

  const fetchers: Promise<{ transfers: RawTransfer[]; source: string }>[] = [
    fetchTransfersFromAtlas(address),
    fetchTransfersFromRpc(address),
  ];

  if (hasMonadscanApiKey()) {
    fetchers.push(fetchTransfersFromMonadscan(address));
  }

  const settled = await Promise.allSettled(fetchers);

  const sourceParts: string[] = [];
  const transferBuckets: RawTransfer[][] = [];

  for (const result of settled) {
    if (result.status === "fulfilled" && result.value.transfers.length > 0) {
      transferBuckets.push(result.value.transfers);
      if (!sourceParts.includes(result.value.source)) {
        sourceParts.push(result.value.source);
      }
    }
  }

  const transfers = mergeTransfers(transferBuckets);
  const source =
    sourceParts.length > 0 ? sourceParts.join("+") : transfers.length > 0 ? "on-chain" : "none";

  const normalized = normalizeTransfers(transfers);
  const trades = enrichTradesWithPrices(normalized, cache.prices);

  const transferHint =
    transfers.length === 0
      ? hasMonadscanApiKey()
        ? "No on-chain transfers found for this wallet in the last ~2 hours. Make a few MON testnet transfers and re-analyze."
        : "Add MONADSCAN_API_KEY to .env for full wallet history (free at etherscan.io/apis). Monad Atlas is often unavailable; RPC scan only covers recent blocks."
      : undefined;

  return {
    trades,
    source,
    transferCount: transfers.length,
    priceSource,
    transferHint,
  };
}
