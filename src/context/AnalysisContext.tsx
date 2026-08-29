"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { BehaviourProfile } from "@/lib/analysis/types";
import type { Trade } from "@/lib/analysis/types";
import type { TradingDNA } from "@/lib/dna/types";
import type { TwinProfile } from "@/lib/twin/types";
import { normalizeTwinProfile } from "@/lib/twin/normalize";
import {
  clearStoredAnalysis,
  loadAnalysis,
  saveAnalysis,
} from "@/lib/storage";
import { useToast } from "@/context/ToastContext";

interface AnalysisState {
  profile: BehaviourProfile | null;
  dna: TradingDNA | null;
  twin: TwinProfile | null;
  trades: Trade[];
  isLoading: boolean;
  error: string | null;
  lastAddress: string | null;
  dataSource: string | null;
  transferCount: number;
  hasOnChainHistory: boolean;
  priceSource: string | null;
  transferHint: string | null;
  hydrated: boolean;
}

interface AnalysisContextValue extends AnalysisState {
  runAnalysis: (address: string) => Promise<boolean>;
  clearAnalysis: () => void;
}

const AnalysisContext = createContext<AnalysisContextValue | null>(null);

const ANALYZE_TIMEOUT_MS = 120_000;

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const { pushToast } = useToast();
  const inFlightRef = useRef<Promise<boolean> | null>(null);
  const [state, setState] = useState<AnalysisState>({
    profile: null,
    dna: null,
    twin: null,
    trades: [],
    isLoading: false,
    error: null,
    lastAddress: null,
    dataSource: null,
    transferCount: 0,
    hasOnChainHistory: false,
    priceSource: null,
    transferHint: null,
    hydrated: false,
  });

  useEffect(() => {
    const stored = loadAnalysis();
    if (stored) {
      setState((s) => ({
        ...s,
        profile: stored.profile,
        dna: stored.dna,
        twin: normalizeTwinProfile(stored.twin),
        trades: stored.trades,
        lastAddress: stored.lastAddress,
        dataSource: stored.dataSource ?? null,
        transferCount: stored.transferCount ?? stored.trades.length,
        hasOnChainHistory: (stored.transferCount ?? stored.trades.length) > 0,
        priceSource: stored.priceSource ?? null,
        hydrated: true,
      }));
    } else {
      setState((s) => ({ ...s, hydrated: true }));
    }
  }, []);

  const runAnalysis = useCallback(
    async (address: string) => {
      if (inFlightRef.current) {
        return inFlightRef.current;
      }

      const task = (async () => {
        setState((s) => ({ ...s, isLoading: true, error: null }));

        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), ANALYZE_TIMEOUT_MS);

        try {
          const res = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address }),
            signal: controller.signal,
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "Analysis failed");

          const transferCount = Number(data.meta?.transferCount ?? 0);
          const hasOnChainHistory = Boolean(data.meta?.hasOnChainHistory);

          let keptPrevious = false;
          setState((s) => {
            if (transferCount === 0 && s.profile && s.twin && s.dna) {
              keptPrevious = true;
              return { ...s, isLoading: false, error: null };
            }

            return {
              profile: data.profile as BehaviourProfile,
              dna: data.dna as TradingDNA,
              twin: normalizeTwinProfile(data.twin as TwinProfile),
              trades: data.trades as Trade[],
              isLoading: false,
              error: null,
              lastAddress: address,
              dataSource: (data.meta?.source as string | undefined) ?? null,
              transferCount,
              hasOnChainHistory,
              priceSource: (data.meta?.priceSource as string | undefined) ?? null,
              transferHint: (data.meta?.transferHint as string | undefined) ?? null,
              hydrated: true,
            };
          });

          if (keptPrevious) {
            pushToast(
              "Could not refresh on-chain data — keeping your previous analysis",
              "warning",
            );
            return true;
          }

          const next = {
            profile: data.profile as BehaviourProfile,
            dna: data.dna as TradingDNA,
            twin: normalizeTwinProfile(data.twin as TwinProfile),
            trades: data.trades as Trade[],
            lastAddress: address,
            dataSource: (data.meta?.source as string | undefined) ?? null,
            transferCount,
            hasOnChainHistory,
            priceSource: (data.meta?.priceSource as string | undefined) ?? null,
            transferHint: (data.meta?.transferHint as string | undefined) ?? null,
          };

          saveAnalysis({
            profile: next.profile,
            dna: next.dna,
            twin: next.twin,
            trades: next.trades,
            lastAddress: address,
            dataSource: next.dataSource ?? undefined,
            transferCount: next.transferCount,
            priceSource: next.priceSource ?? undefined,
          });

          if (hasOnChainHistory) {
            pushToast(
              `Analysis complete — ${transferCount} on-chain transfer${transferCount === 1 ? "" : "s"} found`,
              "success",
            );
          } else {
            pushToast(
              "No on-chain transfers found — send a few testnet MON transfers, then analyze again",
              "warning",
            );
          }
          return true;
        } catch (err) {
          const message =
            err instanceof Error && err.name === "AbortError"
              ? "Analysis timed out — try again in a moment"
              : err instanceof Error
                ? err.message
                : "Analysis failed";
          setState((s) => ({ ...s, isLoading: false, error: message }));
          pushToast(message, "error");
          return false;
        } finally {
          window.clearTimeout(timeoutId);
          inFlightRef.current = null;
        }
      })();

      inFlightRef.current = task;
      return task;
    },
    [pushToast],
  );

  const clearAnalysis = useCallback(() => {
    clearStoredAnalysis();
    setState({
      profile: null,
      dna: null,
      twin: null,
      trades: [],
      isLoading: false,
      error: null,
      lastAddress: null,
      dataSource: null,
      transferCount: 0,
      hasOnChainHistory: false,
      priceSource: null,
      transferHint: null,
      hydrated: true,
    });
  }, []);

  const value = useMemo(
    () => ({ ...state, runAnalysis, clearAnalysis }),
    [state, runAnalysis, clearAnalysis],
  );

  return (
    <AnalysisContext.Provider value={value}>{children}</AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const ctx = useContext(AnalysisContext);
  if (!ctx) throw new Error("useAnalysis must be used within AnalysisProvider");
  return ctx;
}
