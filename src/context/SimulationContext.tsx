"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { MarketSnapshot } from "@/lib/types";
import {
  resetSimulationMarketRounds,
  setSimulationMarketRounds,
} from "@/lib/simulation/market-data";
import {
  createSimulationSession,
  finalizeSimulation,
  processRound,
  SIMULATION_ROUNDS,
} from "@/lib/simulation";
import type {
  SimulationOutcome,
  SimulationSession,
} from "@/lib/simulation/types";
import type { TwinProfile } from "@/lib/twin/types";
import type { TradeSide } from "@/lib/types";
import type { TwinDecisionResult } from "@/lib/twin/types";
import type { RoundRecord } from "@/lib/simulation/types";
import {
  clearStoredSimulation,
  loadSimulation,
  saveSimulation,
} from "@/lib/storage";
import { useToast } from "@/context/ToastContext";

interface SimulationContextValue {
  session: SimulationSession | null;
  outcome: SimulationOutcome | null;
  lastRecord: RoundRecord | null;
  lastTwinResult: TwinDecisionResult | null;
  hydrated: boolean;
  marketsReady: boolean;
  marketsError: string | null;
  startSimulation: () => void;
  submitDecision: (decision: TradeSide, twin: TwinProfile) => void;
  resetSimulation: () => void;
}

const SimulationContext = createContext<SimulationContextValue | null>(null);

export function SimulationProvider({ children }: { children: ReactNode }) {
  const { pushToast } = useToast();
  const [session, setSession] = useState<SimulationSession | null>(null);
  const [outcome, setOutcome] = useState<SimulationOutcome | null>(null);
  const [lastRecord, setLastRecord] = useState<RoundRecord | null>(null);
  const [lastTwinResult, setLastTwinResult] = useState<TwinDecisionResult | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [marketsReady, setMarketsReady] = useState(false);
  const [marketsError, setMarketsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMarketRounds() {
      try {
        const res = await fetch("/api/prices/simulation", { cache: "no-store" });
        const data = (await res.json()) as {
          rounds?: MarketSnapshot[];
          error?: string;
          meta?: { priceSource?: string };
        };

        if (!res.ok) {
          throw new Error(data.error ?? "Failed to load CoinGecko market data");
        }

        if (!data.rounds || data.rounds.length < SIMULATION_ROUNDS) {
          throw new Error("CoinGecko did not return enough rounds for simulation");
        }

        if (data.meta?.priceSource !== "coingecko") {
          throw new Error("Live CoinGecko prices are required for simulation");
        }

        if (!cancelled) {
          setSimulationMarketRounds(data.rounds);
          setMarketsError(null);
          setMarketsReady(true);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load live market prices";
        if (!cancelled) {
          setMarketsError(message);
          setMarketsReady(false);
          pushToast(message, "error");
        }
      }
    }

    void loadMarketRounds();

    return () => {
      cancelled = true;
      resetSimulationMarketRounds();
    };
  }, [pushToast]);

  useEffect(() => {
    const stored = loadSimulation();
    if (stored) {
      setSession(stored.session);
      setOutcome(stored.outcome);
    }
    setHydrated(true);
  }, []);

  const persist = useCallback(
    (nextSession: SimulationSession | null, nextOutcome: SimulationOutcome | null) => {
      saveSimulation({ session: nextSession, outcome: nextOutcome });
    },
    [],
  );

  const startSimulation = useCallback(() => {
    const next = createSimulationSession();
    setSession(next);
    setOutcome(null);
    setLastRecord(null);
    setLastTwinResult(null);
    persist(next, null);
  }, [persist]);

  const submitDecision = useCallback(
    (decision: TradeSide, twin: TwinProfile) => {
      setSession((current) => {
        if (!current || current.status !== "active") return current;

        try {
          const { session: updated, twinResult, record } = processRound(
            current,
            decision,
            twin,
          );

          setLastRecord(record);
          setLastTwinResult(twinResult);

          if (updated.status === "complete") {
            const finalOutcome = finalizeSimulation(updated);
            setOutcome(finalOutcome);
            persist(updated, finalOutcome);
          } else {
            persist(updated, null);
          }

          return updated;
        } catch (err) {
          const message = err instanceof Error ? err.message : "Round failed";
          pushToast(message, "error");
          return current;
        }
      });
    },
    [persist, pushToast],
  );

  const resetSimulation = useCallback(() => {
    setSession(null);
    setOutcome(null);
    setLastRecord(null);
    setLastTwinResult(null);
    clearStoredSimulation();
  }, []);

  const value = useMemo(
    () => ({
      session,
      outcome,
      lastRecord,
      lastTwinResult,
      hydrated,
      marketsReady,
      marketsError,
      startSimulation,
      submitDecision,
      resetSimulation,
    }),
    [
      session,
      outcome,
      lastRecord,
      lastTwinResult,
      hydrated,
      marketsReady,
      marketsError,
      startSimulation,
      submitDecision,
      resetSimulation,
    ],
  );

  return (
    <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>
  );
}

export function useSimulation() {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error("useSimulation must be used within SimulationProvider");
  return ctx;
}
