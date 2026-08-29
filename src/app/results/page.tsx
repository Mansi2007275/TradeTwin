"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { StatCard } from "@/components/ui/StatCard";
import { NetworkSwitchPrompt } from "@/components/wallet/NetworkSwitchPrompt";
import { SectionEyebrow } from "@/components/ui/StatusIndicators";
import { MotionItem } from "@/components/motion/MotionStagger";
import { WinReveal } from "@/components/results/WinReveal";
import { ShareProofTrigger } from "@/components/results/ShareProofPanel";
import { BehavioralSummaryPanel } from "@/components/results/BehavioralSummaryPanel";
import { OnChainProofPanel } from "@/components/onchain/OnChainProofPanel";
import { useSimulation } from "@/context/SimulationContext";
import { useAnalysis } from "@/context/AnalysisContext";
import { useRegistry } from "@/context/RegistryContext";
import { useWallet } from "@/hooks/useWallet";
import { computeWhatIfAnalysis } from "@/lib/simulation";
import { WhatIfPanel } from "@/components/simulation/WhatIfPanel";
import {
  ACHIEVEMENT_BEAT_TWIN,
  simulationMeta,
} from "@/lib/contracts/registry";
import { cn } from "@/lib/utils";
import { LoadingBlock } from "@/components/ui/Spinner";

export default function ResultsPage() {
  const { outcome, startSimulation, hydrated } = useSimulation();
  const { dna } = useAnalysis();
  const {
    recordSimulation,
    recordAchievement,
    readHasAchievement,
    readSimulationCount,
    txState,
  } = useRegistry();
  const { address } = useWallet();
  const router = useRouter();
  const [simRecordedThisSession, setSimRecordedThisSession] = useState(false);
  const [simulationTxHash, setSimulationTxHash] = useState<`0x${string}` | undefined>();
  const [achievementRecorded, setAchievementRecorded] = useState(false);
  const [onChainSimulationCount, setOnChainSimulationCount] = useState(0);

  const refreshAchievementStatus = useCallback(async () => {
    const hasAchievement = await readHasAchievement(ACHIEVEMENT_BEAT_TWIN);
    setAchievementRecorded(hasAchievement);
  }, [readHasAchievement]);

  const refreshSimulationCount = useCallback(async () => {
    const count = await readSimulationCount();
    setOnChainSimulationCount(count);
  }, [readSimulationCount]);

  const whatIf = useMemo(() => {
    if (!outcome) return null;
    return computeWhatIfAnalysis(outcome.rounds, outcome.finalUserValue);
  }, [outcome]);

  useEffect(() => {
    if (!outcome) return;
    setSimRecordedThisSession(false);
    setSimulationTxHash(undefined);
    refreshAchievementStatus();
    refreshSimulationCount();
  }, [outcome, refreshAchievementStatus, refreshSimulationCount]);

  useEffect(() => {
    if (txState.phase !== "confirmed") return;
    if (txState.action === "recordSimulation") {
      setSimRecordedThisSession(true);
      if (txState.hash) setSimulationTxHash(txState.hash);
      refreshSimulationCount();
    }
    if (txState.action === "recordAchievement") {
      refreshAchievementStatus();
    }
  }, [txState.phase, txState.action, refreshAchievementStatus, refreshSimulationCount]);

  if (!hydrated) {
    return (
      <AuthGuard>
        <PageContainer title="Simulation Results" description="Loading results...">
          <LoadingBlock />
        </PageContainer>
      </AuthGuard>
    );
  }

  if (!outcome) {
    return (
      <AuthGuard>
        <PageContainer title="Simulation Results" description="No results yet.">
          <Card className="py-12 text-center">
            <p className="text-[var(--text-muted)]">Complete a simulation first.</p>
            <Button className="mt-4" onClick={() => router.push("/simulation")}>
              Start Simulation
            </Button>
          </Card>
        </PageContainer>
      </AuthGuard>
    );
  }

  const { behavioralExplanation, improvementScore, rounds, winner } = outcome;
  const meta = simulationMeta(outcome);

  const handlePlayAgain = () => {
    startSimulation();
    router.push("/simulation");
  };

  return (
    <AuthGuard>
      <PageContainer
        title="Simulation Results"
        description="5-round historical replay complete. No real funds were used."
      >
        <div className="space-y-12">
        <NetworkSwitchPrompt />

        <WinReveal outcome={outcome} />

        <div className="grid gap-4 lg:grid-cols-12">
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
          <StatCard
            variant="rack"
            label="Your Return"
            value=""
            numericValue={outcome.userReturn}
            isPercent
            trend={outcome.userReturn >= 0 ? "up" : "down"}
          />
          <StatCard
            variant="rack"
            label="Twin Return"
            value=""
            numericValue={outcome.twinReturn}
            isPercent
            trend={outcome.twinReturn >= 0 ? "up" : "down"}
          />
          </div>
          <MotionItem className="lg:col-span-4">
            <div className="surface-panel flex h-full items-center justify-center p-6">
              <ScoreRing score={improvementScore} label="Improvement" size="md" />
            </div>
          </MotionItem>
        </div>

        {dna && <BehavioralSummaryPanel rounds={rounds} dna={dna} />}

        <div className="grid gap-4 lg:grid-cols-2">
          <OnChainProofPanel
            actionId="recordSimulation"
            title="Record Simulation On-Chain"
            description="Permanently log this replay's returns and winner on Monad Testnet."
            actionLabel="Record Simulation On-Chain"
            completed={simRecordedThisSession}
            completedLabel="Simulation recorded on-chain"
            completedDetail={
              onChainSimulationCount > 0
                ? `${onChainSimulationCount} simulation${onChainSimulationCount === 1 ? "" : "s"} stored for your wallet`
                : undefined
            }
            onAction={() =>
              recordSimulation(
                meta.userReturnBps,
                meta.twinReturnBps,
                meta.winner,
                meta.rounds,
              )
            }
          />
          {winner === "user" && (
            <OnChainProofPanel
              actionId="recordAchievement"
              title="Record Achievement On-Chain"
              description="Mint proof that you beat your Trading Twin in this replay."
              actionLabel="Record Beat-Twin Achievement"
              completed={achievementRecorded}
              completedLabel="Achievement recorded on-chain"
              completedDetail={
                achievementRecorded
                  ? "Verified on-chain — this achievement is permanent for your wallet"
                  : undefined
              }
              onAction={() => recordAchievement(ACHIEVEMENT_BEAT_TWIN)}
            />
          )}
        </div>

        {simRecordedThisSession && simulationTxHash && address && (
          <MotionItem>
            <div className="flex flex-col items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-white p-6 text-center shadow-sm">
              <p className="text-sm text-[var(--text-muted)]">
                Your simulation is verified on Monad Testnet. Share your proof card.
              </p>
              <ShareProofTrigger
                winner={winner}
                userReturn={outcome.userReturn}
                twinReturn={outcome.twinReturn}
                walletAddress={address}
                txHash={simulationTxHash}
              />
            </div>
          </MotionItem>
        )}

        <MotionItem>
          <Card padding="lg" className="mt-2">
            <CardHeader title="Behavioural Analysis" eyebrow="Insight" />
            <p className="text-sm leading-relaxed text-[var(--text-heading)]">
              {behavioralExplanation}
            </p>
          </Card>
        </MotionItem>

        <MotionItem>
          <Card padding="lg">
            <CardHeader
              title="Round Breakdown"
              eyebrow="Replay log"
              subtitle="Decisions and portfolio values"
            />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="type-eyebrow text-left">
                    <th className="pb-4 pr-4">Round</th>
                    <th className="pb-4 pr-4">Price</th>
                    <th className="pb-4 pr-4">You</th>
                    <th className="pb-4 pr-4">Twin</th>
                    <th className="pb-4 pr-4">Your Portfolio</th>
                    <th className="pb-4">Twin Portfolio</th>
                  </tr>
                </thead>
                <tbody>
                  {rounds.map((r) => (
                    <tr
                      key={r.roundId}
                      className="border-t border-[var(--border-subtle)] text-[var(--text-heading)]"
                    >
                      <td className="py-3 pr-4 font-data font-medium">{r.roundId}</td>
                      <td className="py-3 pr-4 font-data tabular-nums">
                        ${r.market.price.toLocaleString()}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={cn(
                            "font-data rounded px-2 py-0.5 text-xs font-semibold",
                            r.userDecision === "BUY" && "text-[var(--success)]",
                            r.userDecision === "SELL" && "text-[var(--error)]",
                            r.userDecision === "HOLD" && "text-[var(--text-faint)]",
                          )}
                        >
                          {r.userDecision}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={cn(
                            "font-data rounded px-2 py-0.5 text-xs font-semibold",
                            r.twinDecision === "BUY" && "text-[var(--success)]",
                            r.twinDecision === "SELL" && "text-[var(--error)]",
                            r.twinDecision === "HOLD" && "text-[var(--text-faint)]",
                          )}
                        >
                          {r.twinDecision}
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-data tabular-nums">
                        ${r.userPortfolioAfter.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>
                      <td className="py-3 font-data tabular-nums">
                        ${r.twinPortfolioAfter.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </MotionItem>

        <div>
          <SectionEyebrow className="mb-4">Counterfactual</SectionEyebrow>
          <WhatIfPanel analysis={whatIf!} />
        </div>

        <MotionItem>
          <div className="flex flex-col gap-3 border-t border-[var(--border-subtle)] pt-10 sm:flex-row sm:justify-between">
            <Button variant="secondary" size="lg" onClick={handlePlayAgain}>
              Play Again
            </Button>
            <Link href="/dashboard">
              <Button size="lg">Back to Dashboard</Button>
            </Link>
          </div>
        </MotionItem>
        </div>
      </PageContainer>
    </AuthGuard>
  );
}
