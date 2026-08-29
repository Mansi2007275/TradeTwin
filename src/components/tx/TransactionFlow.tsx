"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TxStatusIndicator } from "@/components/tx/TxStatusIndicator";
import { TxSuccessAnimation } from "@/components/tx/TxSuccessAnimation";
import { Button } from "@/components/ui/Button";
import type { TxState } from "@/context/RegistryContext";
import { shortenAddress } from "@/lib/utils";

interface TransactionFlowProps {
  txState: TxState;
  title: string;
  onReset?: () => void;
  explorerUrl?: string;
}

export function TransactionFlow({
  txState,
  title,
  onReset,
  explorerUrl,
}: TransactionFlowProps) {
  const [glow, setGlow] = useState(false);

  useEffect(() => {
    if (txState.phase === "confirmed") {
      setGlow(true);
      const t = setTimeout(() => setGlow(false), 1200);
      return () => clearTimeout(t);
    }
  }, [txState.phase]);

  if (txState.phase === "idle") return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.28 }}
        className={`neo-raised-sm mt-4 p-5 transition-shadow ${
          glow ? "shadow-[0_0_24px_rgba(91,110,174,0.35)]" : ""
        }`}
      >
        <p className="text-sm font-semibold text-[var(--text-heading)]">{title}</p>

        <div className="mt-3">
          <TxStatusIndicator phase={txState.phase} />
        </div>

        {txState.phase === "confirmed" && (
          <div className="mt-4 flex flex-col items-center gap-3 text-center">
            <TxSuccessAnimation />
            <p className="text-sm text-[var(--success)]">Confirmed on Monad Testnet</p>
            {txState.hash && (
              <p className="font-mono text-xs text-[var(--text-muted)]">
                {shortenAddress(txState.hash, 8)}
              </p>
            )}
            {explorerUrl && (
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-[var(--accent)] hover:underline"
              >
                View on Monad Explorer →
              </a>
            )}
          </div>
        )}

        {txState.phase === "error" && (
          <p className="mt-3 text-sm text-[var(--error)]">{txState.error}</p>
        )}

        {(txState.phase === "confirmed" || txState.phase === "error") && onReset && (
          <div className="mt-4 flex justify-end">
            <Button variant="ghost" size="sm" onClick={onReset}>
              Dismiss
            </Button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
