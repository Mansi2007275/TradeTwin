import { keccak256, toBytes } from "viem";
import type { TwinProfile } from "@/lib/twin/types";
import type { SimulationOutcome } from "@/lib/simulation/types";
import { SIMULATION_ROUNDS } from "@/lib/simulation/types";

export const ACHIEVEMENT_BEAT_TWIN = keccak256(toBytes("BEAT_TWIN"));

export function hashTwinProfile(twin: TwinProfile): `0x${string}` {
  const payload = JSON.stringify({
    walletAddress: twin.walletAddress.toLowerCase(),
    version: twin.version,
    name: twin.name,
    baselineProbabilities: twin.baselineProbabilities,
    weights: twin.weights,
    tradeCount: twin.tradeCount,
    confidence: Math.round(twin.confidence * 1000),
  });
  return keccak256(toBytes(payload));
}

export function winnerToCode(winner: SimulationOutcome["winner"]): number {
  if (winner === "user") return 0;
  if (winner === "twin") return 1;
  return 2;
}

const INT32_MIN = -2_147_483_648;
const INT32_MAX = 2_147_483_647;

export function returnToBps(value: number): number {
  const bps = Math.round(value * 100);
  return Math.max(INT32_MIN, Math.min(INT32_MAX, bps));
}

export function getExplorerTxUrl(hash: string): string {
  return `https://testnet.monadexplorer.com/tx/${hash}`;
}

export function getExplorerAddressUrl(address: string): string {
  return `https://testnet.monadexplorer.com/address/${address}`;
}

export function simulationMeta(outcome: SimulationOutcome) {
  return {
    userReturnBps: returnToBps(outcome.userReturn),
    twinReturnBps: returnToBps(outcome.twinReturn),
    winner: winnerToCode(outcome.winner),
    rounds: SIMULATION_ROUNDS,
  };
}
