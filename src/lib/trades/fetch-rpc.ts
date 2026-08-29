import { formatUnits } from "viem";
import type { RawTransfer } from "@/lib/analysis/types";
import { withTimeout } from "./fetch-utils";

/** ~2 hours of Monad testnet history at ~3.3 blocks/sec (rate-limit safe). */
const MAX_BLOCKS_TO_SCAN = 25_000;
const RPC_BATCH_SIZE = 8;
const BATCH_DELAY_MS = 400;
const RPC_TIMEOUT_MS = 90_000;

const RPC_URL = "https://testnet-rpc.monad.xyz/";

interface RpcBlockTx {
  hash: string;
  from: string;
  to?: string;
  value: string;
}

interface RpcBlock {
  number: string;
  timestamp: string;
  transactions: RpcBlockTx[] | string[];
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function rpcCall<T>(method: string, params: unknown[]): Promise<T> {
  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });

  if (!res.ok) {
    throw new Error(`RPC HTTP ${res.status}`);
  }

  const payload = (await res.json()) as { result?: T; error?: { message?: string } };
  if (payload.error) {
    throw new Error(payload.error.message ?? "RPC error");
  }

  return payload.result as T;
}

async function rpcBatch<T>(calls: { method: string; params: unknown[] }[]): Promise<T[]> {
  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify(
      calls.map((call, index) => ({
        jsonrpc: "2.0",
        id: index + 1,
        method: call.method,
        params: call.params,
      })),
    ),
  });

  if (!res.ok) {
    throw new Error(`RPC batch HTTP ${res.status}`);
  }

  const payload = (await res.json()) as Array<{ result?: T; error?: { message?: string } }>;
  if (!Array.isArray(payload)) {
    throw new Error("Invalid RPC batch response");
  }

  return payload.map((entry, index) => {
    if (entry.error) {
      throw new Error(entry.error.message ?? `RPC batch item ${index} failed`);
    }
    return entry.result as T;
  });
}

function extractTransfersFromBlock(block: RpcBlock, normalized: string): RawTransfer[] {
  const transfers: RawTransfer[] = [];
  const blockNumber = Number.parseInt(block.number, 16);
  const timestamp = Number.parseInt(block.timestamp, 16) * 1000;

  for (const tx of block.transactions) {
    if (typeof tx === "string") continue;

    const from = tx.from.toLowerCase();
    const to = tx.to?.toLowerCase();
    if (from !== normalized && to !== normalized) continue;

    const valueWei = BigInt(tx.value ?? "0x0");
    const amount = valueWei > BigInt(0) ? Number(valueWei) / 1e18 : 0.001;

    transfers.push({
      transactionHash: tx.hash,
      token: "MON",
      tokenSymbol: "MON",
      direction: to === normalized && from !== normalized ? "in" : "out",
      amount,
      timestamp,
      gasUsed: 0,
      blockNumber,
    });
  }

  return transfers;
}

async function scanBlockRangeBackward(
  startBlock: bigint,
  endBlock: bigint,
  normalized: string,
): Promise<RawTransfer[]> {
  const transfers: RawTransfer[] = [];
  const seen = new Set<string>();

  for (let bn = endBlock; bn >= startBlock; bn -= BigInt(RPC_BATCH_SIZE)) {
    const batch: bigint[] = [];
    for (let offset = 0; offset < RPC_BATCH_SIZE && bn - BigInt(offset) >= startBlock; offset++) {
      batch.push(bn - BigInt(offset));
    }

    const calls = batch.map((blockNumber) => ({
      method: "eth_getBlockByNumber",
      params: [`0x${blockNumber.toString(16)}`, true],
    }));

    const blocks = await rpcBatch<RpcBlock>(calls);

    for (const block of blocks) {
      if (!block) continue;
      for (const transfer of extractTransfersFromBlock(block, normalized)) {
        if (seen.has(transfer.transactionHash)) continue;
        seen.add(transfer.transactionHash);
        transfers.push(transfer);
      }
    }

    await sleep(BATCH_DELAY_MS);
  }

  return transfers;
}

export async function fetchWalletBalance(address: string): Promise<number> {
  const balanceHex = await rpcCall<string>("eth_getBalance", [address, "latest"]);
  return Number(formatUnits(BigInt(balanceHex), 18));
}

async function fetchTransfersFromRpcInternal(
  address: string,
): Promise<{ transfers: RawTransfer[]; source: string }> {
  const normalized = address.toLowerCase();
  const latestHex = await rpcCall<string>("eth_blockNumber", []);
  const latest = BigInt(latestHex);
  const startBlock =
    latest > BigInt(MAX_BLOCKS_TO_SCAN) ? latest - BigInt(MAX_BLOCKS_TO_SCAN) : BigInt(0);

  const transfers = await scanBlockRangeBackward(startBlock, latest, normalized);
  transfers.sort((a, b) => a.timestamp - b.timestamp);

  return { transfers, source: "monad-rpc" };
}

export async function fetchTransfersFromRpc(
  address: string,
): Promise<{ transfers: RawTransfer[]; source: string }> {
  return withTimeout(
    fetchTransfersFromRpcInternal(address),
    RPC_TIMEOUT_MS,
    "Monad RPC transfer scan",
  );
}
