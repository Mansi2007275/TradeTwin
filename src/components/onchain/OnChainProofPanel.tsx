"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TransactionFlow } from "@/components/tx/TransactionFlow";
import { MotionItem } from "@/components/motion/MotionStagger";
import { useRegistry, type RegistryAction } from "@/context/RegistryContext";
import { getExplorerAddressUrl } from "@/lib/contracts/registry";
import { shortenAddress } from "@/lib/utils";

interface OnChainProofPanelProps {
  actionId: RegistryAction;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => Promise<boolean>;
  completed?: boolean;
  completedLabel?: string;
  completedDetail?: string;
}

export function OnChainProofPanel({
  actionId,
  title,
  description,
  actionLabel,
  onAction,
  completed = false,
  completedLabel = "Recorded on-chain",
  completedDetail,
}: OnChainProofPanelProps) {
  const {
    isRegistryReady,
    isRegistryValidating,
    registryAddress,
    txState,
    isWritePending,
    isConfirming,
    resetTx,
    explorerUrl,
  } = useRegistry();

  if (isRegistryValidating) {
    return (
      <MotionItem>
        <Card padding="sm">
          <p className="text-sm text-[var(--text-muted)]">Verifying registry contract on Monad Testnet…</p>
        </Card>
      </MotionItem>
    );
  }

  if (!isRegistryReady || !actionId) return null;

  const isActive = txState.action === actionId;
  const isBusy =
    isActive &&
    (txState.phase === "pending" ||
      txState.phase === "confirming" ||
      isWritePending ||
      isConfirming);

  const showCompleted = completed && !isBusy;

  return (
    <MotionItem>
      <Card padding="sm">
        <h3 className="text-sm font-semibold text-[var(--text-heading)]">{title}</h3>
        <p className="mt-1 text-xs text-[var(--text-muted)]">{description}</p>
        <p className="mt-2 font-mono text-[10px] text-[var(--text-muted)]">
          Registry:{" "}
          <a
            href={getExplorerAddressUrl(registryAddress!)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent)] hover:underline"
          >
            {shortenAddress(registryAddress!, 6)}
          </a>
        </p>

        {showCompleted ? (
          <div className="mt-3 space-y-1">
            <p className="text-sm font-medium text-[var(--success)]">{completedLabel}</p>
            {completedDetail && (
              <p className="text-xs text-[var(--text-faint)]">{completedDetail}</p>
            )}
            {isActive && txState.hash && explorerUrl && (
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs font-medium text-[var(--accent)] hover:underline"
              >
                View transaction on Monad Explorer →
              </a>
            )}
          </div>
        ) : (
          <Button
            className="mt-4"
            size="sm"
            onClick={() => void onAction()}
            disabled={
              isBusy ||
              (txState.phase !== "idle" &&
                txState.phase !== "error" &&
                txState.phase !== "confirmed" &&
                !isActive)
            }
          >
            {isBusy ? "Confirm in wallet…" : actionLabel}
          </Button>
        )}

        {isActive && txState.phase !== "idle" && (
          <TransactionFlow
            txState={txState}
            title={title}
            explorerUrl={explorerUrl}
            onReset={resetTx}
          />
        )}
      </Card>
    </MotionItem>
  );
}
