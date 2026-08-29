"use client";

import { useCallback, useEffect, useState } from "react";
import {
  useAccount,
  useBalance,
  useChainId,
  useConnect,
  useDisconnect,
  useSwitchChain,
  useTransactionCount,
} from "wagmi";
import { formatUnits } from "viem";
import { metaMaskConnector, monadTestnet } from "@/config/wagmi";
import { EXPECTED_WALLET, isExpectedWallet } from "@/config/wallet";
import type { WalletInfo } from "@/lib/types";
import { isWalletInstalled, parseWalletError } from "@/lib/errors";
import { switchMetaMaskToMonad } from "@/lib/wallet/monad";
import {
  getMetaMaskActiveAccount,
  openMetaMaskAccountPicker,
  subscribeMetaMaskAccountsChanged,
} from "@/lib/wallet/metamask";
import { shortenAddress } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { useWalletSession } from "@/context/WalletSessionContext";
import {
  clearUserConnectedSession,
  hasUserConnectedSession,
  markUserConnectedSession,
} from "@/lib/wallet/session";

function verifyExpectedAccount(active: string | null | undefined): boolean {
  return isExpectedWallet(active ?? undefined);
}

export function useWallet() {
  const [mounted, setMounted] = useState(false);
  const [metaMaskPreApproved, setMetaMaskPreApproved] = useState<boolean | null>(null);
  const { sessionReady } = useWalletSession();
  const { pushToast } = useToast();
  const { address, isConnected: wagmiConnected, isConnecting, connector } = useAccount();
  const isConnected =
    sessionReady && wagmiConnected && hasUserConnectedSession();
  const chainId = useChainId();
  const isCorrectNetwork = chainId === monadTestnet.id;
  const isExpectedAccount = isExpectedWallet(address);

  const { connect, isPending: isConnectPending, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitchPending, error: switchError } = useSwitchChain();

  const { data: transactionCount } = useTransactionCount({
    address,
    query: { enabled: !!address && isConnected },
  });
  const { data: balanceData } = useBalance({
    address,
    chainId: monadTestnet.id,
    query: { enabled: !!address && isConnected && isCorrectNetwork },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    let cancelled = false;
    getMetaMaskActiveAccount()
      .then((account) => {
        if (!cancelled) {
          setMetaMaskPreApproved(!!account);
        }
      })
      .catch(() => {
        if (!cancelled) setMetaMaskPreApproved(false);
      });

    return () => {
      cancelled = true;
    };
  }, [mounted]);

  useEffect(() => {
    return subscribeMetaMaskAccountsChanged((accounts) => {
      if (!isConnected) return;
      if (accounts.length === 0) return;
      const active = accounts[0];
      if (verifyExpectedAccount(active)) {
        pushToast(`Connected to your wallet ${shortenAddress(EXPECTED_WALLET, 6)}`, "success");
      } else if (active) {
        pushToast(
          `Wrong account — switch MetaMask to ${shortenAddress(EXPECTED_WALLET, 6)}`,
          "warning",
        );
      }
    });
  }, [isConnected, pushToast]);

  const monBalance =
    balanceData && isCorrectNetwork
      ? Number(formatUnits(balanceData.value, balanceData.decimals))
      : null;

  const wallet: WalletInfo | null =
    isConnected && address
      ? {
          address,
          network: isCorrectNetwork ? monadTestnet.name : "Wrong Network",
          chainId: chainId ?? 0,
          isCorrectNetwork,
          transactionCount: Number(transactionCount ?? 0),
        }
      : null;

  const switchToExpectedWallet = useCallback(async () => {
    if (!isWalletInstalled()) {
      pushToast("Install MetaMask to connect your wallet.", "error");
      window.open("https://metamask.io/download/", "_blank");
      return false;
    }

    const accounts = await openMetaMaskAccountPicker();
    const active = accounts[0] ?? (await getMetaMaskActiveAccount());

    if (verifyExpectedAccount(active)) {
      pushToast(`Your wallet ${shortenAddress(EXPECTED_WALLET, 6)} is active`, "success");
      await switchMetaMaskToMonad();
      return true;
    }

    pushToast(
      `Select ${EXPECTED_WALLET} in the MetaMask account picker`,
      "warning",
    );
    return false;
  }, [pushToast]);

  const connectWallet = useCallback(() => {
    if (!isWalletInstalled()) {
      pushToast("Install MetaMask to connect your wallet.", "error");
      window.open("https://metamask.io/download/", "_blank");
      return;
    }

    connect(
      { connector: metaMaskConnector },
      {
        onSuccess: async () => {
          markUserConnectedSession();
          let active = await getMetaMaskActiveAccount();

          if (!verifyExpectedAccount(active)) {
            pushToast(
              `Please select ${shortenAddress(EXPECTED_WALLET, 6)} in MetaMask`,
              "warning",
            );
            const accounts = await openMetaMaskAccountPicker();
            active = accounts[0] ?? (await getMetaMaskActiveAccount());
          }

          await switchMetaMaskToMonad();

          if (verifyExpectedAccount(active)) {
            pushToast(
              `Connected to ${shortenAddress(EXPECTED_WALLET, 6)} on Monad Testnet`,
              "success",
            );
          } else {
            pushToast(
              `Connected, but wrong account. Switch MetaMask to ${EXPECTED_WALLET}`,
              "warning",
            );
          }
        },
        onError: (err) => pushToast(parseWalletError(err), "error"),
      },
    );
  }, [connect, pushToast]);

  const disconnectWallet = useCallback(() => {
    clearUserConnectedSession();
    disconnect();
    pushToast("Wallet disconnected", "info");
  }, [disconnect, pushToast]);

  const switchToMonad = useCallback(async () => {
    try {
      const ok = await switchMetaMaskToMonad();
      if (ok) {
        pushToast("Switched to Monad Testnet", "success");
        return;
      }
      switchChain(
        { chainId: monadTestnet.id },
        {
          onError: (err) => pushToast(parseWalletError(err), "error"),
          onSuccess: () => pushToast("Switched to Monad Testnet", "success"),
        },
      );
    } catch (err) {
      pushToast(parseWalletError(err), "error");
    }
  }, [switchChain, pushToast]);

  const isMetaMask =
    connector?.name?.toLowerCase().includes("metamask") ?? isWalletInstalled();

  return {
    wallet,
    address: isConnected ? address : undefined,
    expectedWallet: EXPECTED_WALLET,
    monBalance,
    isConnected,
    isConnecting: isConnecting || isConnectPending,
    isSwitching: isSwitchPending,
    isCorrectNetwork,
    isExpectedAccount,
    isMetaMask,
    metaMaskPreApproved,
    connectWallet,
    switchToExpectedWallet,
    disconnectWallet,
    switchToMonad,
    connectError: connectError ? parseWalletError(connectError) : null,
    switchError: switchError ? parseWalletError(switchError) : null,
    hasWallet: mounted ? isWalletInstalled() : null,
  };
}
