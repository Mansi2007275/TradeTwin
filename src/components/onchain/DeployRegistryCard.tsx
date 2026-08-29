"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccount, useChainId, useWalletClient, useWaitForTransactionReceipt } from "wagmi";
import { monadTestnet } from "@/config/wagmi";
import { tradeTwinRegistryAbi } from "@/lib/contracts/abi";
import { saveRegistryAddress } from "@/config/registry";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TransactionFlow } from "@/components/tx/TransactionFlow";
import { MotionItem } from "@/components/motion/MotionStagger";
import { useToast } from "@/context/ToastContext";
import { parseWalletError } from "@/lib/errors";
import { getExplorerTxUrl } from "@/lib/contracts/registry";
import type { TxState } from "@/context/RegistryContext";
import registryArtifact from "../../../artifacts/contracts/TradeTwinRegistry.sol/TradeTwinRegistry.json";

interface DeployRegistryCardProps {
  onDeployed: (address: `0x${string}`) => void;
}

export function DeployRegistryCard({ onDeployed }: DeployRegistryCardProps) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const isCorrectNetwork = chainId === monadTestnet.id;
  const { data: walletClient } = useWalletClient();
  const { pushToast } = useToast();
  const [txState, setTxState] = useState<TxState>({ phase: "idle" });
  const [deployHash, setDeployHash] = useState<`0x${string}` | undefined>();
  const [confirmed, setConfirmed] = useState(false);

  const { data: receipt, isSuccess } = useWaitForTransactionReceipt({
    hash: deployHash,
    chainId: monadTestnet.id,
    query: { enabled: !!deployHash && !confirmed },
  });

  useEffect(() => {
    if (!isSuccess || !receipt?.contractAddress || confirmed) return;
    const contractAddress = receipt.contractAddress as `0x${string}`;
    saveRegistryAddress(contractAddress);
    onDeployed(contractAddress);
    setConfirmed(true);
    setTxState({ phase: "confirmed", hash: deployHash });
    pushToast("Registry deployed on Monad Testnet", "success");
  }, [isSuccess, receipt, confirmed, deployHash, onDeployed, pushToast]);

  const deploy = useCallback(async () => {
    if (!isConnected || !address || !walletClient) {
      pushToast("Connect your wallet to deploy the registry", "warning");
      return;
    }

    if (!isCorrectNetwork) {
      pushToast("Switch to Monad Testnet (Chain ID 10143) before deploying", "warning");
      return;
    }

    try {
      setTxState({ phase: "pending" });
      const hash = await walletClient.deployContract({
        abi: tradeTwinRegistryAbi,
        bytecode: registryArtifact.bytecode as `0x${string}`,
        account: address,
        chain: monadTestnet,
      });
      setDeployHash(hash);
      setTxState({ phase: "confirming", hash });
      pushToast("Deployment submitted — confirming on-chain", "info");
    } catch (err) {
      const message = parseWalletError(err);
      setTxState({ phase: "error", error: message });
      pushToast(message, "error");
    }
  }, [address, isConnected, isCorrectNetwork, pushToast, walletClient]);

  return (
    <MotionItem>
      <Card className="mb-6" padding="sm">
        <h3 className="text-base font-semibold text-[var(--text-heading)]">
          Deploy On-Chain Registry
        </h3>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          One-time setup: deploy the TradeTwinRegistry contract to Monad Testnet.
          This enables verifiable twin registration, simulation records, and achievements.
        </p>
        <Button
          className="mt-4"
          onClick={deploy}
          disabled={txState.phase === "pending" || txState.phase === "confirming"}
        >
          {txState.phase === "pending" || txState.phase === "confirming"
            ? "Deploying..."
            : "Deploy Registry Contract"}
        </Button>
        <TransactionFlow
          txState={txState}
          title="Registry deployment"
          explorerUrl={deployHash ? getExplorerTxUrl(deployHash) : undefined}
          onReset={() => setTxState({ phase: "idle" })}
        />
      </Card>
    </MotionItem>
  );
}
