"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  useAccount,
  useChainId,
  usePublicClient,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { tradeTwinRegistryAbi } from "@/lib/contracts/abi";
import { hasContractBytecode, parseTwinExists } from "@/lib/contracts/read";
import { getExplorerTxUrl } from "@/lib/contracts/registry";
import { resolveRegistryAddress, saveRegistryAddress } from "@/config/registry";
import { monadTestnet } from "@/config/wagmi";
import { useToast } from "@/context/ToastContext";
import { parseWalletError } from "@/lib/errors";

export type TxPhase = "idle" | "pending" | "confirming" | "confirmed" | "error";

export type RegistryAction =
  | "registerTwin"
  | "recordSimulation"
  | "recordAchievement"
  | null;

export interface TxState {
  phase: TxPhase;
  hash?: `0x${string}`;
  error?: string;
  action?: RegistryAction;
}

interface RegistryContextValue {
  registryAddress: `0x${string}` | null;
  isRegistryReady: boolean;
  isRegistryValidating: boolean;
  setRegistryAddress: (address: `0x${string}`) => void;
  txState: TxState;
  isWritePending: boolean;
  isConfirming: boolean;
  resetTx: () => void;
  registerTwin: (twinHash: `0x${string}`, tradeCount: bigint) => Promise<boolean>;
  recordSimulation: (
    userReturnBps: number,
    twinReturnBps: number,
    winner: number,
    rounds: number,
  ) => Promise<boolean>;
  recordAchievement: (achievementId: `0x${string}`) => Promise<boolean>;
  readTwinRegistered: () => Promise<boolean>;
  readSimulationCount: () => Promise<number>;
  readHasAchievement: (achievementId: `0x${string}`) => Promise<boolean>;
  explorerUrl?: string;
}

const RegistryContext = createContext<RegistryContextValue | null>(null);

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;

export function RegistryProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const isCorrectNetwork = chainId === monadTestnet.id;
  const publicClient = usePublicClient({ chainId: monadTestnet.id });
  const { pushToast } = useToast();
  const [registryAddress, setRegistryAddressState] = useState<`0x${string}` | null>(null);
  const [registryValidated, setRegistryValidated] = useState(false);
  const [isRegistryValidating, setIsRegistryValidating] = useState(true);
  const [txState, setTxState] = useState<TxState>({ phase: "idle" });

  useEffect(() => {
    setRegistryAddressState(resolveRegistryAddress());
  }, []);

  const validateRegistry = useCallback(
    async (addr: `0x${string}` | null) => {
      if (!addr || addr === ZERO_ADDRESS || !publicClient) {
        setRegistryValidated(false);
        setIsRegistryValidating(false);
        return;
      }

      setIsRegistryValidating(true);
      const valid = await hasContractBytecode(
        (args) => publicClient.getBytecode(args),
        addr,
      );
      setRegistryValidated(valid);
      setIsRegistryValidating(false);

      if (!valid) {
        pushToast(
          "Registry address has no contract code — deploy again from the dashboard",
          "warning",
        );
      }
    },
    [publicClient, pushToast],
  );

  useEffect(() => {
    validateRegistry(registryAddress);
  }, [registryAddress, validateRegistry]);

  const setRegistryAddress = useCallback(
    (addr: `0x${string}`) => {
      saveRegistryAddress(addr);
      setRegistryAddressState(addr);
      validateRegistry(addr);
    },
    [validateRegistry],
  );

  const { writeContractAsync, isPending: isWritePending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess, isError, error: receiptError } =
    useWaitForTransactionReceipt({
      hash: txState.hash,
      chainId: monadTestnet.id,
      query: { enabled: !!txState.hash && txState.phase === "confirming" },
    });

  useEffect(() => {
    if (txState.phase !== "confirming") return;
    if (isConfirming) return;
    if (isSuccess) {
      setTxState((s) => ({ ...s, phase: "confirmed" }));
      pushToast("Transaction confirmed on Monad Testnet", "success");
    } else if (isError) {
      const message = parseWalletError(receiptError);
      setTxState((s) => ({ ...s, phase: "error", error: message }));
      pushToast(message, "error");
    }
  }, [isConfirming, isSuccess, isError, receiptError, txState.phase, pushToast]);

  const resetTx = useCallback(() => setTxState({ phase: "idle", action: null }), []);

  const executeWrite = useCallback(
    async (
      call: {
        abi: typeof tradeTwinRegistryAbi;
        functionName: "registerTwin" | "recordSimulation" | "recordAchievement";
        args: readonly unknown[];
        action: RegistryAction;
      },
      label: string,
    ): Promise<boolean> => {
      if (!isConnected || !address) {
        pushToast("Connect your wallet first", "warning");
        return false;
      }
      if (!isCorrectNetwork) {
        pushToast("Switch to Monad Testnet before submitting transactions", "warning");
        return false;
      }
      if (!registryAddress || registryAddress === ZERO_ADDRESS) {
        pushToast("Deploy the registry contract from your dashboard first", "warning");
        return false;
      }
      if (!registryValidated) {
        pushToast("Registry contract is invalid — redeploy from the dashboard", "warning");
        return false;
      }
      if (!publicClient) {
        pushToast("Unable to reach Monad RPC", "error");
        return false;
      }

      try {
        setTxState({ phase: "pending", action: call.action });

        await publicClient.simulateContract({
          address: registryAddress,
          abi: tradeTwinRegistryAbi,
          functionName: call.functionName,
          args: call.args as never,
          account: address,
          chain: monadTestnet,
        });

        const hash = await writeContractAsync({
          address: registryAddress,
          abi: tradeTwinRegistryAbi,
          functionName: call.functionName,
          args: call.args as never,
          chainId: monadTestnet.id,
        });

        setTxState({ phase: "confirming", hash, action: call.action });
        pushToast(`${label} submitted — waiting for confirmation`, "info");
        return true;
      } catch (err) {
        const message = parseWalletError(err);
        setTxState({ phase: "error", error: message, action: call.action });
        pushToast(message, "error");
        return false;
      }
    },
    [
      address,
      isConnected,
      isCorrectNetwork,
      publicClient,
      pushToast,
      registryAddress,
      registryValidated,
      writeContractAsync,
    ],
  );

  const registerTwin = useCallback(
    (twinHash: `0x${string}`, tradeCount: bigint) =>
      executeWrite(
        {
          abi: tradeTwinRegistryAbi,
          functionName: "registerTwin",
          args: [twinHash, tradeCount],
          action: "registerTwin",
        },
        "Twin registration",
      ),
    [executeWrite],
  );

  const recordSimulation = useCallback(
    (userReturnBps: number, twinReturnBps: number, winner: number, rounds: number) =>
      executeWrite(
        {
          abi: tradeTwinRegistryAbi,
          functionName: "recordSimulation",
          args: [userReturnBps, twinReturnBps, winner, rounds],
          action: "recordSimulation",
        },
        "Simulation recording",
      ),
    [executeWrite],
  );

  const recordAchievement = useCallback(
    (achievementId: `0x${string}`) =>
      executeWrite(
        {
          abi: tradeTwinRegistryAbi,
          functionName: "recordAchievement",
          args: [achievementId],
          action: "recordAchievement",
        },
        "Achievement recording",
      ),
    [executeWrite],
  );

  const readTwinRegistered = useCallback(async () => {
    if (!address || !registryAddress || !publicClient || !registryValidated) return false;
    try {
      const result = await publicClient.readContract({
        address: registryAddress,
        abi: tradeTwinRegistryAbi,
        functionName: "twins",
        args: [address],
      });
      return parseTwinExists(result);
    } catch {
      return false;
    }
  }, [address, publicClient, registryAddress, registryValidated]);

  const readSimulationCount = useCallback(async () => {
    if (!address || !registryAddress || !publicClient || !registryValidated) return 0;
    try {
      const count = await publicClient.readContract({
        address: registryAddress,
        abi: tradeTwinRegistryAbi,
        functionName: "getSimulationCount",
        args: [address],
      });
      return Number(count);
    } catch {
      return 0;
    }
  }, [address, publicClient, registryAddress, registryValidated]);

  const readHasAchievement = useCallback(
    async (achievementId: `0x${string}`) => {
      if (!address || !registryAddress || !publicClient || !registryValidated) return false;
      try {
        return await publicClient.readContract({
          address: registryAddress,
          abi: tradeTwinRegistryAbi,
          functionName: "hasAchievement",
          args: [address, achievementId],
        });
      } catch {
        return false;
      }
    },
    [address, publicClient, registryAddress, registryValidated],
  );

  const value = useMemo(
    () => ({
      registryAddress,
      isRegistryReady:
        !!registryAddress &&
        registryAddress !== ZERO_ADDRESS &&
        registryValidated &&
        !isRegistryValidating,
      isRegistryValidating,
      setRegistryAddress,
      txState,
      isWritePending,
      isConfirming,
      resetTx,
      registerTwin,
      recordSimulation,
      recordAchievement,
      readTwinRegistered,
      readSimulationCount,
      readHasAchievement,
      explorerUrl: txState.hash ? getExplorerTxUrl(txState.hash) : undefined,
    }),
    [
      registryAddress,
      registryValidated,
      isRegistryValidating,
      setRegistryAddress,
      txState,
      isWritePending,
      isConfirming,
      resetTx,
      registerTwin,
      recordSimulation,
      recordAchievement,
      readTwinRegistered,
      readSimulationCount,
      readHasAchievement,
    ],
  );

  return (
    <RegistryContext.Provider value={value}>{children}</RegistryContext.Provider>
  );
}

export function useRegistry() {
  const ctx = useContext(RegistryContext);
  if (!ctx) throw new Error("useRegistry must be used within RegistryProvider");
  return ctx;
}
