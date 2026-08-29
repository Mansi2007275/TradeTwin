"use client";

import { MotionFadeUp } from "@/components/motion/MotionStagger";
import { LogoMark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { EXPECTED_WALLET } from "@/config/wallet";
import { useWallet } from "@/hooks/useWallet";

interface WalletConnectEmptyStateProps {
  title?: string;
  description?: string;
}

export function WalletConnectEmptyState({
  title = "Connect your wallet to continue",
  description = "Link MetaMask on Monad Testnet to unlock your trading dashboard and analysis.",
}: WalletConnectEmptyStateProps) {
  const { connectWallet, isConnecting, hasWallet } = useWallet();

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-20">
      <MotionFadeUp>
        <div className="max-w-md rounded-xl border border-[var(--border-subtle)] bg-white p-8 text-center shadow-sm">
          <LogoMark size="lg" />
          <h2 className="mt-6 text-lg font-semibold text-[var(--text-display)]">{title}</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">{description}</p>
          <p className="font-data mt-4 break-all text-xs text-[var(--text-faint)]">{EXPECTED_WALLET}</p>
          {hasWallet === false ? (
            <p className="mt-6 text-sm text-[var(--text-muted)]">
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[var(--accent)] underline underline-offset-2"
              >
                Install MetaMask
              </a>
            </p>
          ) : (
            <Button className="mt-6 w-full" size="lg" onClick={connectWallet} disabled={isConnecting}>
              {isConnecting ? "Opening MetaMask…" : "Connect My Wallet"}
            </Button>
          )}
        </div>
      </MotionFadeUp>
    </div>
  );
}
