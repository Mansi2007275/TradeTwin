"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MotionItem } from "@/components/motion/MotionStagger";
import { SectionEyebrow } from "@/components/ui/StatusIndicators";
import { useWallet } from "@/hooks/useWallet";
import { monadTestnet } from "@/config/wagmi";

export function NetworkSwitchPrompt() {
  const { isConnected, isCorrectNetwork, switchToMonad, isSwitching } = useWallet();

  if (!isConnected || isCorrectNetwork) return null;

  return (
    <MotionItem>
      <Card variant="ghost" padding="md" hover={false} className="border-[var(--warning)]/40">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <SectionEyebrow className="!text-[var(--warning)]">Network required</SectionEyebrow>
            <p className="text-sm text-[var(--text-muted)]">
              Switch to {monadTestnet.name} (Chain ID {monadTestnet.id}) to continue.
            </p>
          </div>
          <Button onClick={switchToMonad} disabled={isSwitching}>
            {isSwitching ? "Switching..." : "Switch to Monad Testnet"}
          </Button>
        </div>
      </Card>
    </MotionItem>
  );
}
