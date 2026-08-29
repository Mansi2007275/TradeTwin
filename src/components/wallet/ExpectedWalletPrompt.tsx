"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MotionItem } from "@/components/motion/MotionStagger";
import { SectionEyebrow } from "@/components/ui/StatusIndicators";
import { useWallet } from "@/hooks/useWallet";
import { EXPECTED_WALLET } from "@/config/wallet";

export function ExpectedWalletPrompt() {
  const { isConnected, isExpectedAccount, switchToExpectedWallet, isConnecting } =
    useWallet();

  if (!isConnected || isExpectedAccount) return null;

  return (
    <MotionItem>
      <Card variant="ghost" padding="md" hover={false}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <SectionEyebrow>Account mismatch</SectionEyebrow>
            <p className="text-sm text-[var(--text-muted)]">
              Select this wallet in MetaMask:
            </p>
            <p className="font-data mt-2 break-all text-xs text-[var(--text-heading)]">
              {EXPECTED_WALLET}
            </p>
          </div>
          <Button onClick={switchToExpectedWallet} disabled={isConnecting}>
            {isConnecting ? "Opening MetaMask..." : "Select My Wallet"}
          </Button>
        </div>
      </Card>
    </MotionItem>
  );
}
