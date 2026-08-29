"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type StatusTone = "live" | "ready" | "warning" | "offline";

interface LandingConnectionStatusProps {
  mounted: boolean;
  hasWallet: boolean | null;
  isConnected: boolean;
  isConnecting: boolean;
  isExpectedAccount: boolean;
  isCorrectNetwork: boolean;
}

function resolveStatus({
  mounted,
  hasWallet,
  isConnected,
  isConnecting,
  isExpectedAccount,
  isCorrectNetwork,
}: LandingConnectionStatusProps): { label: string; tone: StatusTone } | null {
  if (!mounted) return null;

  if (hasWallet === false) {
    return { label: "Install MetaMask to connect", tone: "offline" };
  }

  if (isConnecting) {
    return { label: "Awaiting MetaMask approval…", tone: "ready" };
  }

  if (isConnected && isExpectedAccount && isCorrectNetwork) {
    return { label: "Connected · Monad Testnet", tone: "live" };
  }

  if (isConnected && isExpectedAccount && !isCorrectNetwork) {
    return { label: "Wrong network — switch to Monad", tone: "warning" };
  }

  if (isConnected && !isExpectedAccount) {
    return { label: "Wrong wallet selected", tone: "warning" };
  }

  if (hasWallet) {
    return { label: "MetaMask detected · Not connected", tone: "ready" };
  }

  return null;
}

const toneDot: Record<StatusTone, string> = {
  live: "bg-[var(--success)]",
  ready: "bg-[var(--text-faint)]",
  warning: "bg-[var(--warning)]",
  offline: "bg-[var(--text-faint)]",
};

export function LandingConnectionStatus(props: LandingConnectionStatusProps) {
  const status = resolveStatus(props);
  if (!status) return null;

  const { label, tone } = status;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="mb-6 flex justify-center"
    >
      <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--text-muted)]">
        <span className={cn("h-2 w-2 rounded-full", toneDot[tone])} aria-hidden />
        {label}
      </span>
    </motion.div>
  );
}
