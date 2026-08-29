"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/Button";
import { ShareProofCard } from "@/components/results/ShareProofCard";
import { getExplorerTxUrl } from "@/lib/contracts/registry";
import { useToast } from "@/context/ToastContext";
import type { SimulationOutcome } from "@/lib/simulation/types";

interface ShareProofPanelProps {
  open: boolean;
  onClose: () => void;
  winner: SimulationOutcome["winner"];
  userReturn: number;
  twinReturn: number;
  walletAddress: string;
  txHash: `0x${string}`;
}

function headlineForWinner(winner: SimulationOutcome["winner"]): string {
  if (winner === "user") return "I beat my Trading Twin";
  if (winner === "twin") return "My Twin beat me";
  return "I tied with my Trading Twin";
}

export function ShareProofPanel({
  open,
  onClose,
  winner,
  userReturn,
  twinReturn,
  walletAddress,
  txHash,
}: ShareProofPanelProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const { pushToast } = useToast();
  const explorerUrl = getExplorerTxUrl(txHash);
  const headline = headlineForWinner(winner);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current || downloading) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `tradetwin-proof-${txHash.slice(2, 10)}.png`;
      link.href = dataUrl;
      link.click();
      pushToast("Proof card saved as PNG", "success");
    } catch {
      pushToast("Could not generate image — try again", "error");
    } finally {
      setDownloading(false);
    }
  }, [downloading, pushToast, txHash]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(explorerUrl);
      pushToast("Explorer link copied to clipboard", "success");
    } catch {
      pushToast("Could not copy link", "error");
    }
  }, [explorerUrl, pushToast]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-proof-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-[#0f172a]/40 backdrop-blur-sm"
            aria-label="Close share proof"
            onClick={onClose}
          />

          <motion.div
            className="relative z-10 flex w-full max-w-lg flex-col items-center gap-5"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={(e) => e.stopPropagation()}
          >
            <p id="share-proof-title" className="sr-only">
              Share your on-chain simulation proof
            </p>

            <div className="overflow-hidden rounded-xl shadow-[var(--brutal-shadow-lg)]">
              <ShareProofCard
                ref={cardRef}
                headline={headline}
                userReturn={userReturn}
                twinReturn={twinReturn}
                walletAddress={walletAddress}
                txHash={txHash}
                explorerUrl={explorerUrl}
              />
            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                onClick={() => void handleDownload()}
                disabled={downloading}
                className="sm:min-w-[140px]"
              >
                {downloading ? "Generating…" : "Download PNG"}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => void handleCopyLink()}
                className="sm:min-w-[140px]"
              >
                Copy Link
              </Button>
              <Button variant="ghost" size="lg" onClick={onClose}>
                Close
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ShareProofTriggerProps {
  winner: SimulationOutcome["winner"];
  userReturn: number;
  twinReturn: number;
  walletAddress: string;
  txHash: `0x${string}`;
}

export function ShareProofTrigger({
  winner,
  userReturn,
  twinReturn,
  walletAddress,
  txHash,
}: ShareProofTriggerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="lg" onClick={() => setOpen(true)}>
        Share Your Proof
      </Button>
      <ShareProofPanel
        open={open}
        onClose={() => setOpen(false)}
        winner={winner}
        userReturn={userReturn}
        twinReturn={twinReturn}
        walletAddress={walletAddress}
        txHash={txHash}
      />
    </>
  );
}
