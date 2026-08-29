"use client";

import { motion } from "framer-motion";
import { Spinner } from "@/components/ui/Spinner";
import type { TxPhase } from "@/context/RegistryContext";
import { cn } from "@/lib/utils";

const steps: { key: TxPhase; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "confirming", label: "Confirming" },
  { key: "confirmed", label: "Confirmed" },
];

function stepIndex(phase: TxPhase): number {
  if (phase === "idle" || phase === "error") return -1;
  if (phase === "pending") return 0;
  if (phase === "confirming") return 1;
  return 2;
}

export function TxStatusIndicator({
  phase,
  className,
}: {
  phase: TxPhase;
  className?: string;
}) {
  if (phase === "idle") return null;

  const active = stepIndex(phase);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {steps.map((step, i) => {
        const isActive = i === active;
        const isDone = i < active || phase === "confirmed";
        return (
          <div key={step.key} className="flex items-center gap-2">
            <motion.div
              animate={{
                scale: isActive ? 1.05 : 1,
                opacity: isDone || isActive ? 1 : 0.45,
              }}
              transition={{ duration: 0.25 }}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                isDone && "neo-inset-sm text-[var(--success)]",
                isActive && !isDone && "neo-raised-sm text-[var(--accent)]",
                !isDone && !isActive && "text-[var(--text-muted)]",
              )}
            >
              {isActive && phase !== "confirmed" && <Spinner size="sm" />}
              {step.label}
            </motion.div>
            {i < steps.length - 1 && (
              <span className="h-px w-4 bg-[var(--shadow-dark)]" />
            )}
          </div>
        );
      })}
    </div>
  );
}
