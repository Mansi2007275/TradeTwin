"use client";

import { Button } from "@/components/ui/Button";
import { monadTestnet } from "@/config/wagmi";
import { shortenAddress } from "@/lib/utils";

interface DashboardWalletHeroProps {
  address: string;
  isCorrectNetwork: boolean;
  isExpectedAccount: boolean;
  monBalance: number | null;
  isLoading: boolean;
  hasExistingAnalysis: boolean;
  error: string | null;
  canAnalyze: boolean;
  onAnalyze: () => void;
  onSwitchNetwork: () => void;
  isSwitching: boolean;
}

export function DashboardWalletHero({
  address,
  isCorrectNetwork,
  isExpectedAccount,
  monBalance,
  isLoading,
  hasExistingAnalysis,
  error,
  canAnalyze,
  onAnalyze,
  onSwitchNetwork,
  isSwitching,
}: DashboardWalletHeroProps) {
  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-white p-6 shadow-sm sm:p-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="type-eyebrow">Connected Wallet</p>
          <p className="font-data mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            {shortenAddress(address, 6)}
          </p>
          <p className="font-data mt-1 break-all text-xs text-[var(--text-muted)]">{address}</p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="brutal-chip">
              {isCorrectNetwork ? monadTestnet.name : "Wrong network"}
            </span>
            {!isExpectedAccount && (
              <span className="brutal-chip text-[var(--error)]">Wrong account</span>
            )}
            {isCorrectNetwork && monBalance !== null && (
              <span className="brutal-chip">{monBalance.toFixed(4)} MON</span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:min-w-[220px] lg:items-end">
          {error && <p className="text-sm text-[var(--error)]">{error}</p>}
          {!isCorrectNetwork ? (
            <Button size="lg" onClick={onSwitchNetwork} disabled={isSwitching}>
              {isSwitching ? "Switching…" : "Switch to Monad Testnet"}
            </Button>
          ) : (
            <Button size="lg" disabled={!canAnalyze || isLoading} onClick={onAnalyze}>
              {isLoading
                ? hasExistingAnalysis
                  ? "Refreshing…"
                  : "Analyzing…"
                : hasExistingAnalysis
                  ? "Re-analyze Trading"
                  : "Analyze My Trading"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
