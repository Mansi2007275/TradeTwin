"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { PageContainer } from "@/components/layout/PageContainer";
import { NetworkSwitchPrompt } from "@/components/wallet/NetworkSwitchPrompt";
import { TwinDecisionPanel } from "@/components/twin/TwinDecisionPanel";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { CountUp } from "@/components/motion/CountUp";
import { DataValue, SectionEyebrow } from "@/components/ui/StatusIndicators";
import { MotionItem } from "@/components/motion/MotionStagger";
import { useAnalysis } from "@/context/AnalysisContext";
import { generateBehaviorSummary, generateTwinTraits } from "@/lib/dna/engine";
import { buildSimulationState, computeTwinDecision } from "@/lib/twin";
import { useWallet } from "@/hooks/useWallet";
import { OnChainProofPanel } from "@/components/onchain/OnChainProofPanel";
import { useRegistry } from "@/context/RegistryContext";
import { hashTwinProfile } from "@/lib/contracts/registry";
import { LoadingBlock } from "@/components/ui/Spinner";

export default function TwinPage() {
  const { isCorrectNetwork, address } = useWallet();
  const { dna, twin, profile, isLoading, runAnalysis, hydrated } = useAnalysis();
  const { registerTwin, readTwinRegistered, txState } = useRegistry();
  const [twinOnChain, setTwinOnChain] = useState(false);
  const autoAnalyzeRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (!twin) return;
    readTwinRegistered().then(setTwinOnChain);
  }, [twin, readTwinRegistered, txState.phase]);

  useEffect(() => {
    if (!hydrated || twin || !address || autoAnalyzeRef.current) return;
    autoAnalyzeRef.current = true;
    void runAnalysis(address);
  }, [hydrated, twin, address, runAnalysis]);

  const previewDecision = useMemo(() => {
    if (!twin) return null;
    const state = buildSimulationState({
      round: 1,
      priceChangePercent: 6.5,
      hasOpenPosition: false,
      volatility: 6.5,
    });
    return computeTwinDecision(twin, state);
  }, [twin]);

  if (!hydrated || (!dna && isLoading)) {
    return (
      <AuthGuard>
        <PageContainer title="Trading Twin" description="Loading your twin profile...">
          <LoadingBlock label="Building behavioural model..." />
        </PageContainer>
      </AuthGuard>
    );
  }

  if (!dna || !profile || !twin) {
    return (
      <AuthGuard>
        <PageContainer title="Trading Twin" description="Loading your twin profile...">
          <Card variant="ghost" className="py-12 text-center">
            <p className="text-[var(--text-muted)]">
              {isLoading
                ? "Building behavioural model from your trading DNA..."
                : "Analyze your trading first to build your Twin."}
            </p>
            {!isLoading && (
              <Button className="mt-6" onClick={() => router.push("/dashboard")}>
                Go to Dashboard
              </Button>
            )}
          </Card>
        </PageContainer>
      </AuthGuard>
    );
  }

  const behaviorSummary = generateBehaviorSummary(dna);
  const traits = generateTwinTraits(dna);
  const { baselineProbabilities: base, patterns } = twin;

  return (
    <AuthGuard>
      <PageContainer
        title="Trading Twin"
        description="It trades like you, not like the market."
      >
        <div className="space-y-10">
          <NetworkSwitchPrompt />

          <div className="grid gap-10 xl:grid-cols-12">
            <MotionItem className="xl:col-span-8">
              <Card variant="hero" padding="lg">
                <CardHeader
                  eyebrow="Twin profile"
                  title={twin.name}
                  subtitle={`Built from ${profile.tradeCount} analyzed trades`}
                />

                <div className="space-y-8">
                  <div>
                    <SectionEyebrow>Behaviour summary</SectionEyebrow>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--text-heading)]">
                      {behaviorSummary}
                    </p>
                  </div>

                  <div>
                    <SectionEyebrow>Baseline probabilities</SectionEyebrow>
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      {(
                        [
                          ["Buy", base.buy],
                          ["Hold", base.hold],
                          ["Sell", base.sell],
                        ] as const
                      ).map(([label, prob]) => (
                        <div key={label} className="surface-inset px-3 py-4 text-center">
                          <p className="type-eyebrow">{label}</p>
                          <p className="font-data mt-2 text-xl font-semibold text-[var(--text-display)]">
                            <CountUp value={prob * 100} decimals={0} suffix="%" />
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <SectionEyebrow>DNA-derived traits</SectionEyebrow>
                    <ul className="mt-3 space-y-2">
                      {traits.map((trait) => (
                        <li
                          key={trait}
                          className="surface-rack px-4 py-3 text-sm text-[var(--text-heading)]"
                        >
                          {trait}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </MotionItem>

            <aside className="space-y-4 xl:col-span-4">
              <SectionEyebrow className="px-1">Model stats</SectionEyebrow>

              <MotionItem>
                <Card variant="rack" padding="md" hover={false}>
                  <SectionEyebrow>Confidence</SectionEyebrow>
                  <DataValue size="lg" className="mt-2">
                    <CountUp
                      value={Math.round(twin.confidence * 100)}
                      decimals={0}
                      suffix="%"
                    />
                  </DataValue>
                  <p className="mt-2 text-xs text-[var(--text-faint)]">
                    {twin.tradeCount} trades · {patterns.tradesPerWeek.toFixed(1)}/wk avg
                  </p>
                </Card>
              </MotionItem>

              {previewDecision && <TwinDecisionPanel result={previewDecision} />}

              <MotionItem>
                <Card variant="ghost" padding="md" hover={false}>
                  <SectionEyebrow>Note</SectionEyebrow>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                    Your Twin models decision behaviour — it does not predict future prices.
                  </p>
                </Card>
              </MotionItem>

              <MotionItem>
                <OnChainProofPanel
                  actionId="registerTwin"
                  title="Register Twin On-Chain"
                  description="Store a cryptographic proof of your behavioural twin on Monad Testnet."
                  actionLabel="Register Twin On-Chain"
                  completed={twinOnChain}
                  completedLabel="Twin registered on-chain"
                  onAction={async () => {
                    const ok = await registerTwin(
                      hashTwinProfile(twin),
                      BigInt(twin.tradeCount),
                    );
                    return ok;
                  }}
                />
              </MotionItem>

              <MotionItem>
                <Link href="/simulation" className="block">
                  <Button size="lg" className="w-full" disabled={!isCorrectNetwork}>
                    Beat My Twin
                  </Button>
                </Link>
              </MotionItem>
            </aside>
          </div>
        </div>
      </PageContainer>
    </AuthGuard>
  );
}
