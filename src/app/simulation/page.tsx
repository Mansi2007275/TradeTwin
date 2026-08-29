"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { PageContainer, MotionItem } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PortfolioStat } from "@/components/ui/StatCard";
import { DecisionButtons } from "@/components/simulation/DecisionButtons";
import { DNAEvolutionChart } from "@/components/charts/DNAEvolutionChart";
import { CandlestickChart } from "@/components/charts/CandlestickChart";
import { OrderTicketPanel } from "@/components/simulation/OrderTicketPanel";
import { TwinDecisionPanel } from "@/components/twin/TwinDecisionPanel";
import { WhyWeDifferedPanel } from "@/components/simulation/WhyWeDifferedPanel";
import { NetworkSwitchPrompt } from "@/components/wallet/NetworkSwitchPrompt";
import { useAnalysis } from "@/context/AnalysisContext";
import { useSimulation } from "@/context/SimulationContext";
import { useWallet } from "@/hooks/useWallet";
import {
  getMarketForRound,
  INITIAL_PORTFOLIO,
  SIMULATION_ROUNDS,
} from "@/lib/simulation";
import { portfolioValue } from "@/lib/simulation/portfolio";
import { buildWhyWeDiffered } from "@/lib/simulation/why-we-differed";
import { cn } from "@/lib/utils";
import { LoadingBlock } from "@/components/ui/Spinner";
import type { TradeSide } from "@/lib/types";

export default function SimulationPage() {
  const router = useRouter();
  const { twin, dna, runAnalysis, isLoading, lastAddress, hydrated: analysisHydrated } =
    useAnalysis();
  const { isCorrectNetwork, address } = useWallet();
  const walletAddress = address ?? lastAddress;

  const {
    session,
    lastRecord,
    lastTwinResult,
    startSimulation,
    submitDecision,
    hydrated,
    marketsReady,
    marketsError,
  } = useSimulation();

  const [showRoundResult, setShowRoundResult] = useState(false);
  const autoAnalyzeRef = useRef(false);

  useEffect(() => {
    if (!analysisHydrated || twin || !walletAddress || autoAnalyzeRef.current) return;
    autoAnalyzeRef.current = true;
    void runAnalysis(walletAddress);
  }, [analysisHydrated, twin, walletAddress, runAnalysis]);

  useEffect(() => {
    if (twin && !session && marketsReady) {
      startSimulation();
    }
  }, [twin, session, marketsReady, startSimulation]);

  const whyDiffered = useMemo(() => {
    if (!session || !lastRecord || !twin || !dna || !lastRecord.divergence.diverged) {
      return null;
    }
    const brokeCount = session.completedRounds.filter((r) => r.divergence.diverged).length;
    return buildWhyWeDiffered(lastRecord, twin, dna, brokeCount);
  }, [session, lastRecord, twin, dna]);

  if (!hydrated || !marketsReady) {
    return (
      <AuthGuard>
        <PageContainer title="Simulation" description="Loading session...">
          {marketsError ? (
            <Card variant="ghost" className="py-12 text-center">
              <p className="text-[var(--error)]">{marketsError}</p>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Simulation requires live ETH/USD prices from CoinGecko. Check your API key in
                .env and reload.
              </p>
              <Button className="mt-6" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </Card>
          ) : (
            <LoadingBlock label="Loading live CoinGecko market data..." />
          )}
        </PageContainer>
      </AuthGuard>
    );
  }

  if (!twin) {
    return (
      <AuthGuard>
        <PageContainer title="Simulation" description="Loading twin model...">
          {isLoading ? (
            <LoadingBlock label="Building your Trading Twin..." />
          ) : (
            <Card variant="ghost" className="py-12 text-center">
              <p className="text-[var(--text-muted)]">Analyze your wallet first.</p>
              <Button className="mt-6" onClick={() => router.push("/dashboard")}>
                Go to Dashboard
              </Button>
            </Card>
          )}
        </PageContainer>
      </AuthGuard>
    );
  }

  if (!session) {
    return (
      <AuthGuard>
        <PageContainer title="Simulation" description="Starting simulation...">
          <LoadingBlock label="Preparing 5-round historical replay..." />
        </PageContainer>
      </AuthGuard>
    );
  }

  const playingRoundIndex = Math.min(session.currentRound, SIMULATION_ROUNDS - 1);
  const isComplete = session.status === "complete";
  const isLastRoundPlayed =
    showRoundResult && session.completedRounds.length === SIMULATION_ROUNDS;

  const lastCompletedRound =
    session.completedRounds[session.completedRounds.length - 1] ?? null;

  const market =
    showRoundResult && lastRecord?.market
      ? lastRecord.market
      : isComplete && lastCompletedRound?.market
        ? lastCompletedRound.market
        : getMarketForRound(playingRoundIndex);

  const price = market.price;

  const userPortfolioValue =
    showRoundResult && lastRecord
      ? lastRecord.userPortfolioAfter
      : portfolioValue(session.userPortfolio, price);

  const twinPortfolioValue =
    showRoundResult && lastRecord
      ? lastRecord.twinPortfolioAfter
      : portfolioValue(session.twinPortfolio, price);

  const handleDecision = (decision: TradeSide) => {
    if (showRoundResult || isComplete) return;
    submitDecision(decision, twin);
    setShowRoundResult(true);
  };

  const handleNext = () => {
    if (isLastRoundPlayed || isComplete) {
      router.push("/results");
      return;
    }
    setShowRoundResult(false);
  };

  const displayRound = showRoundResult
    ? session.completedRounds.length
    : playingRoundIndex + 1;

  return (
    <AuthGuard>
      <PageContainer
        title="Simulation"
        description="Risk-free historical replay — virtual $10,000, no real funds."
      >
        <div className="space-y-6">
          <NetworkSwitchPrompt />

          {twin.lowDataMode !== false && (twin.lowDataMode || twin.tradeCount < 3) && (
            <MotionItem>
              <Card variant="ghost" padding="md" hover={false}>
                <p className="text-sm text-[var(--warning)]">
                  Limited on-chain history ({twin.tradeCount} transfers). Add{" "}
                  <code className="text-xs">MONADSCAN_API_KEY</code> in your environment (Vercel
                  Settings → Environment Variables or local <code className="text-xs">.env</code>
                  ), re-analyze on Dashboard, then restart simulation.
                </p>
              </Card>
            </MotionItem>
          )}

          <MotionItem>
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[var(--border-subtle)] bg-white px-4 py-3">
              <p className="font-data text-sm font-semibold text-[var(--text-display)]">
                Round {displayRound} / {SIMULATION_ROUNDS}
              </p>
              <div className="flex gap-1">
                {Array.from({ length: SIMULATION_ROUNDS }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1.5 w-8 rounded-full",
                      i < session.completedRounds.length
                        ? "bg-[var(--text-display)]"
                        : i === playingRoundIndex && !showRoundResult
                          ? "bg-[var(--accent)]"
                          : "bg-[var(--surface-muted)]",
                    )}
                  />
                ))}
              </div>
            </div>
          </MotionItem>

          <MotionItem>
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <DNAEvolutionChart scores={dna?.scores ?? null} />
              </div>
              <CandlestickChart market={market} />
            </div>
          </MotionItem>

          <div className="grid gap-4 sm:grid-cols-2">
            <PortfolioStat label="Your Portfolio" value={userPortfolioValue || INITIAL_PORTFOLIO} />
            <PortfolioStat label="Twin Portfolio" value={twinPortfolioValue || INITIAL_PORTFOLIO} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <OrderTicketPanel
              title="Your Decision"
              price={`$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
              amount={`$${(userPortfolioValue || INITIAL_PORTFOLIO).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            >
              {!showRoundResult && !isComplete && playingRoundIndex < SIMULATION_ROUNDS ? (
                <DecisionButtons onDecision={handleDecision} disabled={!isCorrectNetwork} />
              ) : lastRecord ? (
                <p className="font-data text-center text-lg font-bold text-[var(--accent)]">
                  {lastRecord.userDecision}
                </p>
              ) : null}
            </OrderTicketPanel>

            <OrderTicketPanel
              title="Twin's Decision"
              price={`$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
              amount={`$${(twinPortfolioValue || INITIAL_PORTFOLIO).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
              footer={
                showRoundResult && lastTwinResult ? (
                  <TwinDecisionPanel result={lastTwinResult} />
                ) : undefined
              }
            >
              {showRoundResult && lastRecord ? (
                <p
                  className={cn(
                    "font-data text-center text-lg font-bold",
                    lastRecord.twinDecision === "BUY" && "text-[var(--success)]",
                    lastRecord.twinDecision === "SELL" && "text-[var(--error)]",
                    lastRecord.twinDecision === "HOLD" && "text-[var(--text-muted)]",
                  )}
                >
                  {lastRecord.twinDecision}
                </p>
              ) : (
                <p className="text-center text-sm text-[var(--text-muted)]">
                  Submit your decision to reveal the Twin&apos;s move
                </p>
              )}
            </OrderTicketPanel>
          </div>

          {showRoundResult && whyDiffered && (
            <WhyWeDifferedPanel explanation={whyDiffered} />
          )}

          {showRoundResult && lastRecord && (
            <MotionItem>
              <div className="flex justify-end">
                <Button size="lg" onClick={handleNext}>
                  {isLastRoundPlayed || isComplete ? "View Results" : "Next Round →"}
                </Button>
              </div>
            </MotionItem>
          )}
        </div>
      </PageContainer>
    </AuthGuard>
  );
}
