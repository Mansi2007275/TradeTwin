"use client";

import { useWallet } from "@/hooks/useWallet";
import { WalletConnectEmptyState } from "@/components/wallet/WalletConnectEmptyState";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SectionEyebrow } from "@/components/ui/StatusIndicators";
import { EXPECTED_WALLET } from "@/config/wallet";
import { monadTestnet } from "@/config/wagmi";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const {
    isConnected,
    isCorrectNetwork,
    isExpectedAccount,
    switchToMonad,
    switchToExpectedWallet,
    isSwitching,
    isConnecting,
  } = useWallet();

  if (!isConnected) {
    return <WalletConnectEmptyState />;
  }

  if (!isCorrectNetwork) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-20">
        <Card className="max-w-md p-8 text-center" padding="md" hover={false}>
          <SectionEyebrow className="!text-[var(--warning)]">Wrong network</SectionEyebrow>
          <h2 className="mt-3 text-lg font-semibold text-[var(--text-display)]">
            Switch to Monad Testnet
          </h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            TradeTwin requires {monadTestnet.name} (Chain ID {monadTestnet.id}) for on-chain
            analysis and registry transactions.
          </p>
          <Button className="mt-6 w-full" onClick={switchToMonad} disabled={isSwitching}>
            {isSwitching ? "Switching..." : "Switch to Monad Testnet"}
          </Button>
        </Card>
      </div>
    );
  }

  if (!isExpectedAccount) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-20">
        <Card className="max-w-md p-8 text-center" padding="md" hover={false}>
          <SectionEyebrow>Account mismatch</SectionEyebrow>
          <h2 className="mt-3 text-lg font-semibold text-[var(--text-display)]">
            Select your registered wallet
          </h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Connect the wallet registered for this TradeTwin session in MetaMask.
          </p>
          <p className="font-data mt-4 break-all text-xs text-[var(--text-faint)]">{EXPECTED_WALLET}</p>
          <Button
            className="mt-6 w-full"
            onClick={switchToExpectedWallet}
            disabled={isConnecting}
          >
            {isConnecting ? "Opening MetaMask..." : "Select My Wallet"}
          </Button>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
