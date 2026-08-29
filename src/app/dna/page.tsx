"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { PageContainer } from "@/components/layout/PageContainer";
import { NetworkSwitchPrompt } from "@/components/wallet/NetworkSwitchPrompt";
import {
  DNAScoreCard,
  DNAScoreOverview,
} from "@/components/analysis/DNAScoreCard";
import { MetricSection } from "@/components/analysis/MetricCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LoadingBlock } from "@/components/ui/Spinner";
import { SectionEyebrow } from "@/components/ui/StatusIndicators";
import { DataValue } from "@/components/ui/StatusIndicators";
import { MotionItem } from "@/components/motion/MotionStagger";
import { useAnalysis } from "@/context/AnalysisContext";
import { metricSections } from "@/lib/analysis/format";
import { useWallet } from "@/hooks/useWallet";

export default function DNAPage() {
  const { isCorrectNetwork, address } = useWallet();
  const { profile, dna, isLoading, error, runAnalysis, hydrated } = useAnalysis();
  const [showRaw, setShowRaw] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!profile && address && hydrated && !isLoading && !error) {
      runAnalysis(address);
    }
  }, [profile, address, hydrated, isLoading, error, runAnalysis]);

  if (!hydrated) {
    return (
      <AuthGuard>
        <PageContainer title="Trading DNA" description="Loading session...">
          <LoadingBlock />
        </PageContainer>
      </AuthGuard>
    );
  }

  if (!profile && isLoading) {
    return (
      <AuthGuard>
        <PageContainer
          title="Trading DNA"
          description="Analyzing your on-chain history..."
        >
          <LoadingBlock label="Fetching transfers and computing DNA scores..." />
        </PageContainer>
      </AuthGuard>
    );
  }

  if (!profile || !dna) {
    return (
      <AuthGuard>
        <PageContainer title="Trading DNA" description="No analysis available yet.">
          <Card variant="ghost" className="py-12 text-center">
            <p className="text-[var(--text-muted)]">
              {error ?? "Run analysis from your dashboard first."}
            </p>
            <Button className="mt-6" onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </Button>
          </Card>
        </PageContainer>
      </AuthGuard>
    );
  }

  const sections = metricSections(profile);
  const confidencePct = Math.round(dna.overallConfidence * 100);

  return (
    <AuthGuard>
      <PageContainer
        title="Trading DNA"
        description="Five scores (0–100) computed deterministically from your on-chain metrics."
      >
        <div className="space-y-12">
          <NetworkSwitchPrompt />

          <MotionItem>
            <Card variant="hero" padding="lg">
              <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <SectionEyebrow>Analysis summary</SectionEyebrow>
                  <p className="mt-2 text-sm text-[var(--text-muted)]">
                    <span className="font-data font-semibold text-[var(--text-display)]">
                      {profile.tradeCount}
                    </span>{" "}
                    trades · source{" "}
                    <span className="font-data text-[var(--text-heading)]">{profile.dataSource}</span>
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-faint)]">
                    Computed {new Date(dna.computedAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <SectionEyebrow className="sm:text-right">Overall confidence</SectionEyebrow>
                  <DataValue size="xl">{confidencePct}%</DataValue>
                </div>
              </div>
            </Card>
          </MotionItem>

          <DNAScoreOverview scores={dna.scores} />

          <div className="space-y-4">
            <SectionEyebrow className="px-1">Score breakdown</SectionEyebrow>
            {dna.scores.map((score) => (
              <DNAScoreCard key={score.id} score={score} />
            ))}
          </div>

          <MotionItem>
            <Button variant="ghost" size="sm" onClick={() => setShowRaw((v) => !v)}>
              {showRaw ? "Hide" : "Show"} raw metrics
            </Button>
            {showRaw && (
              <div className="mt-6 space-y-10 border-t border-[var(--border-subtle)] pt-8">
                {sections.map((section) => (
                  <MetricSection
                    key={section.title}
                    title={section.title}
                    metrics={section.metrics}
                  />
                ))}
              </div>
            )}
          </MotionItem>

          <MotionItem>
            <div className="flex justify-end border-t border-[var(--border-subtle)] pt-10">
              <Link href="/twin">
                <Button size="lg" disabled={!isCorrectNetwork}>
                  View My Trading Twin →
                </Button>
              </Link>
            </div>
          </MotionItem>
        </div>
      </PageContainer>
    </AuthGuard>
  );
}
