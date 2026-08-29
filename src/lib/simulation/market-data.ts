import type { MarketSnapshot } from "@/lib/types";
import { SIMULATION_ROUNDS } from "./types";

let activeRounds: MarketSnapshot[] = [];

export function setSimulationMarketRounds(rounds: MarketSnapshot[]): void {
  if (rounds.length >= SIMULATION_ROUNDS) {
    activeRounds = rounds;
  }
}

export function resetSimulationMarketRounds(): void {
  activeRounds = [];
}

export function hasSimulationMarketsLoaded(): boolean {
  return activeRounds.length >= SIMULATION_ROUNDS;
}

export function getActiveMarketRounds(): MarketSnapshot[] {
  return activeRounds;
}

export function getMarketForRound(roundIndex: number): MarketSnapshot {
  if (activeRounds.length < SIMULATION_ROUNDS) {
    throw new Error(
      "Simulation market data not loaded — live CoinGecko prices are required before playing.",
    );
  }

  const clamped = Math.max(0, Math.min(roundIndex, activeRounds.length - 1));
  return activeRounds[clamped]!;
}

export function getVolumeChangePercent(roundIndex: number): number {
  if (roundIndex === 0 || activeRounds.length === 0) return 0;
  const prev = activeRounds[roundIndex - 1];
  const curr = activeRounds[roundIndex];
  if (!prev || !curr || prev.volume24h <= 0) return 0;
  return ((curr.volume24h - prev.volume24h) / prev.volume24h) * 100;
}
