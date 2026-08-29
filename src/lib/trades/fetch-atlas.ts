import type { RawTransfer } from "@/lib/analysis/types";
import { withTimeout } from "./fetch-utils";

const ATLAS_API = "https://api.monadatlas.com/api/address_transfers";
const ATLAS_TIMEOUT_MS = 15_000;
const MAX_PAGES = 5;
const PAGE_LIMIT = 500;

interface AtlasTransfer {
  transactionHash?: string;
  txHash?: string;
  hash?: string;
  token?: string;
  tokenAddress?: string;
  tokenSymbol?: string;
  symbol?: string;
  direction?: string;
  transferType?: string;
  amount?: string | number;
  value?: string | number;
  timestamp?: string | number;
  blockTimestamp?: string | number;
  gasUsed?: string | number;
  blockNumber?: number;
}

interface AtlasResponse {
  transfers?: AtlasTransfer[];
  nextCursor?: string | null;
}

function parseAmount(raw: string | number | undefined): number {
  if (raw === undefined) return 0;
  const n = typeof raw === "string" ? parseFloat(raw) : raw;
  return Number.isFinite(n) ? n : 0;
}

function parseTimestamp(raw: string | number | undefined): number | null {
  if (raw === undefined) return null;
  if (typeof raw === "number") {
    return raw < 1e12 ? raw * 1000 : raw;
  }
  const parsed = Date.parse(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapTransfer(t: AtlasTransfer): RawTransfer | null {
  const hash = t.transactionHash ?? t.txHash ?? t.hash;
  if (!hash) return null;

  const timestamp = parseTimestamp(t.timestamp ?? t.blockTimestamp);
  if (timestamp === null) return null;

  const direction =
    t.direction === "in" || t.direction === "out"
      ? t.direction
      : t.transferType?.includes("out")
        ? "out"
        : "in";

  const amount = parseAmount(t.amount ?? t.value);
  if (amount <= 0) return null;

  const token = t.token ?? t.tokenAddress ?? "MON";
  const tokenSymbol = t.tokenSymbol ?? t.symbol ?? (token === "MON" ? "MON" : "TOKEN");

  return {
    transactionHash: hash,
    token: tokenSymbol,
    tokenSymbol,
    direction: direction as "in" | "out",
    amount,
    timestamp,
    gasUsed: parseAmount(t.gasUsed),
    blockNumber: t.blockNumber ?? 0,
  };
}

export async function fetchTransfersFromAtlas(
  address: string,
): Promise<{ transfers: RawTransfer[]; source: string }> {
  return withTimeout(
    fetchTransfersFromAtlasInternal(address),
    ATLAS_TIMEOUT_MS,
    "Monad Atlas transfer fetch",
  );
}

async function fetchTransfersFromAtlasInternal(
  address: string,
): Promise<{ transfers: RawTransfer[]; source: string }> {
  const transfers: RawTransfer[] = [];
  let cursor: string | undefined;

  for (let page = 0; page < MAX_PAGES; page++) {
    const params = new URLSearchParams({
      address,
      limit: String(PAGE_LIMIT),
      direction: "both",
    });
    if (cursor) params.set("cursor", cursor);

    const res = await fetch(`${ATLAS_API}?${params}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Monad Atlas error (${res.status}): ${body.slice(0, 120)}`);
    }

    const data = (await res.json()) as AtlasResponse;
    const batch = (data.transfers ?? [])
      .map((t) => mapTransfer(t))
      .filter((t): t is RawTransfer => t !== null);

    transfers.push(...batch);
    cursor = data.nextCursor ?? undefined;
    if (!cursor || batch.length === 0) break;
  }

  return { transfers, source: "monad-atlas" };
}
