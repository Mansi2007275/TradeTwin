"use client";

import { useRouter } from "next/navigation";
import { PageContainer, MotionItem } from "@/components/layout/PageContainer";
import { NetworkSwitchPrompt } from "@/components/wallet/NetworkSwitchPrompt";
import { ExpectedWalletPrompt } from "@/components/wallet/ExpectedWalletPrompt";
import { WalletConnectEmptyState } from "@/components/wallet/WalletConnectEmptyState";
import { DeployRegistryCard } from "@/components/onchain/DeployRegistryCard";
import { DashboardWalletHero } from "@/components/dashboard/DashboardWalletHero";
import { DNAGlanceCard } from "@/components/dashboard/DNAGlanceCard";
import { GradientStatCard } from "@/components/charts/GradientStatCard";
import { Card } from "@/components/ui/Card";
import { LoadingBlock } from "@/components/ui/Spinner";
import { useAnalysis } from "@/context/AnalysisContext";
import { useRegistry } from "@/context/RegistryContext";
import { useWallet } from "@/hooks/useWallet";

export default function DashboardPage() {
  const {
    wallet,
    isConnected,
    isCorrectNetwork,
    address,
    monBalance,
    isExpectedAccount,
    isSwitching,
    switchToMonad,
  } = useWallet();
  const canAnalyze = isConnected && isCorrectNetwork && isExpectedAccount;
  const { profile, dna, isLoading, error, runAnalysis, hydrated, dataSource, transferCount, transferHint } =
    useAnalysis();
  const { isRegistryReady, setRegistryAddress } = useRegistry();
  const router = useRouter();

  const hasTradingHistory = (profile?.tradeCount ?? 0) > 0;
  const winRateValue = profile?.winRate;

  const handleAnalyze = async () => {
    if (!address) return;
    const ok = await runAnalysis(address);
    if (ok) router.push("/dna");
  };

  if (!hydrated) {
    return (
      <PageContainer title="Wallet Dashboard" description="Loading your session...">
        <LoadingBlock label="Restoring session..." />
      </PageContainer>
    );
  }

  if (!isConnected || !address) {
    return (
      <PageContainer
        title="Wallet Dashboard"
        description="Connect MetaMask to view your trading activity."
        shell
      >
        <WalletConnectEmptyState
          title="Connect your wallet to see your dashboard"
          description="Link MetaMask on Monad Testnet to unlock balances, stats, and behavioural analysis."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Wallet Dashboard"
      description="Your connected wallet and on-chain trading activity."
    >
      <div className="space-y-6">
        <MotionItem>
          <DashboardWalletHero
            address={address}
            isCorrectNetwork={isCorrectNetwork}
            isExpectedAccount={isExpectedAccount}
            monBalance={monBalance}
            isLoading={isLoading}
            hasExistingAnalysis={!!profile}
            error={error}
            canAnalyze={canAnalyze}
            onAnalyze={handleAnalyze}
            onSwitchNetwork={switchToMonad}
            isSwitching={isSwitching}
          />
        </MotionItem>

        <MotionItem>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <GradientStatCard
              variant="amber"
              label="Transfers Found"
              value={String(profile?.tradeCount ?? 0)}
              trend={
                profile
                  ? {
                      direction: profile.closedPositionCount > 0 ? "up" : "down",
                      label: `${profile.closedPositionCount} closed`,
                    }
                  : undefined
              }
              seed={profile?.tradeCount ?? 0}
            />
            <GradientStatCard
              variant="slate"
              label="Outgoing Txs"
              value={String(wallet?.transactionCount ?? 0)}
              trend={{ direction: "up", label: "On-chain nonce" }}
              seed={wallet?.transactionCount ?? 0}
            />
            <GradientStatCard
              variant="purple"
              label="DNA Confidence"
              value={dna ? `${Math.round(dna.overallConfidence * 100)}%` : "—"}
              trend={
                dna
                  ? { direction: "up", label: `${profile?.tradeCount ?? 0} trades` }
                  : undefined
              }
              seed={dna ? Math.round(dna.overallConfidence * 100) : 0}
            />
            <GradientStatCard
              variant="emerald"
              label="Win Rate"
              value={
                winRateValue && !winRateValue.insufficientData
                  ? `${winRateValue.value.toFixed(1)}%`
                  : "—"
              }
              trend={
                winRateValue && winRateValue.sampleSize > 0
                  ? {
                      direction: winRateValue.value >= 50 ? "up" : "down",
                      label: `${winRateValue.sampleSize} positions`,
                    }
                  : { direction: "down", label: "Analyze to compute" }
              }
              seed={winRateValue ? Math.round(winRateValue.value) : 0}
            />
          </div>
        </MotionItem>

        <NetworkSwitchPrompt />
        <ExpectedWalletPrompt />

        {!isRegistryReady && <DeployRegistryCard onDeployed={setRegistryAddress} />}

        <MotionItem>
          <DNAGlanceCard scores={dna?.scores} />
        </MotionItem>

        {!hasTradingHistory && isCorrectNetwork && (
          <MotionItem>
            <Card variant="ghost" padding="md" hover={false}>
              <p className="text-sm text-[var(--text-muted)]">
                No on-chain transfers found yet. Send a few MON transfers on Monad Testnet, then
                run Analyze again.
                {transferHint && (
                  <span className="mt-2 block text-xs text-[var(--warning)]">{transferHint}</span>
                )}
                {dataSource && dataSource !== "none" && (
                  <span className="mt-2 block text-xs text-[var(--text-faint)]">
                    Last scan: {dataSource}
                    {transferCount > 0 ? ` · ${transferCount} transfers` : ""}
                  </span>
                )}
              </p>
            </Card>
          </MotionItem>
        )}

        {hasTradingHistory && dataSource && (
          <MotionItem>
            <Card variant="ghost" padding="md" hover={false}>
              <p className="text-xs text-[var(--text-faint)]">
                On-chain data: {dataSource} · {transferCount} transfer
                {transferCount === 1 ? "" : "s"}
              </p>
            </Card>
          </MotionItem>
        )}
      </div>
    </PageContainer>
  );
}
