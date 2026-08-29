import type { RawTransfer } from "@/lib/analysis/types";
import { withTimeout } from "./fetch-utils";

const MONAD_TESTNET_CHAIN_ID = 10143;
const MONADSCAN_API = "https://api.etherscan.io/v2/api";
const MONADSCAN_TIMEOUT_MS = 20_000;
const MAX_TX_PAGES = 5;
const PAGE_OFFSET = 1000;

interface MonadscanTx {
  hash?: string;
  from?: string;
  to?: string;
  value?: string;
  timeStamp?: string;
  blockNumber?: string;
  gasUsed?: string;
  isError?: string;
}

interface MonadscanResponse {
  status?: string;
  message?: string;
  result?: MonadscanTx[] | string;
}

function getMonadscanApiKey(): string | null {
  const key =
    process.env.MONADSCAN_API_KEY?.trim() ?? process.env.ETHERSCAN_API_KEY?.trim();
  return key || null;
}

function mapTx(tx: MonadscanTx, normalized: string): RawTransfer | null {
  if (!tx.hash || tx.isError === "1") return null;

  const valueWei = BigInt(tx.value ?? "0");
  const from = tx.from?.toLowerCase();
  const to = tx.to?.toLowerCase();
  if (!from || !to) return null;
  if (from !== normalized && to !== normalized) return null;

  const timestamp = Number(tx.timeStamp);
  if (!Number.isFinite(timestamp) || timestamp <= 0) return null;

  const amount = valueWei > BigInt(0) ? Number(valueWei) / 1e18 : 0.001;

  return {
    transactionHash: tx.hash,
    token: "MON",
    tokenSymbol: "MON",
    direction: to === normalized && from !== normalized ? "in" : "out",
    amount,
    timestamp: timestamp * 1000,
    gasUsed: Number(tx.gasUsed ?? 0),
    blockNumber: Number(tx.blockNumber ?? 0),
  };
}

async function fetchMonadscanPage(
  address: string,
  page: number,
  apiKey: string,
): Promise<MonadscanTx[]> {
  const params = new URLSearchParams({
    chainid: String(MONAD_TESTNET_CHAIN_ID),
    module: "account",
    action: "txlist",
    address,
    startblock: "0",
    endblock: "99999999",
    page: String(page),
    offset: String(PAGE_OFFSET),
    sort: "asc",
    apikey: apiKey,
  });

  const res = await fetch(`${MONADSCAN_API}?${params}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Monadscan error (${res.status}): ${body.slice(0, 120)}`);
  }

  const data = (await res.json()) as MonadscanResponse;

  if (data.status !== "1" || !Array.isArray(data.result)) {
    const detail =
      typeof data.result === "string"
        ? data.result
        : (data.message ?? "Monadscan returned no transactions");
    throw new Error(detail);
  }

  return data.result;
}

export function hasMonadscanApiKey(): boolean {
  return getMonadscanApiKey() !== null;
}

export async function fetchTransfersFromMonadscan(
  address: string,
): Promise<{ transfers: RawTransfer[]; source: string }> {
  return withTimeout(
    fetchTransfersFromMonadscanInternal(address),
    MONADSCAN_TIMEOUT_MS,
    "Monadscan transfer fetch",
  );
}

async function fetchTransfersFromMonadscanInternal(
  address: string,
): Promise<{ transfers: RawTransfer[]; source: string }> {
  const apiKey = getMonadscanApiKey();
  if (!apiKey) {
    throw new Error("MONADSCAN_API_KEY is not configured");
  }

  const normalized = address.toLowerCase();
  const transfers: RawTransfer[] = [];
  const seen = new Set<string>();

  for (let page = 1; page <= MAX_TX_PAGES; page++) {
    const batch = await fetchMonadscanPage(address, page, apiKey);
    if (batch.length === 0) break;

    for (const tx of batch) {
      const mapped = mapTx(tx, normalized);
      if (!mapped || seen.has(mapped.transactionHash)) continue;
      seen.add(mapped.transactionHash);
      transfers.push(mapped);
    }

    if (batch.length < PAGE_OFFSET) break;
  }

  transfers.sort((a, b) => a.timestamp - b.timestamp);
  return { transfers, source: "monadscan" };
}
