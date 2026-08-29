"use client";

import { useWallet } from "@/hooks/useWallet";
import { useMounted } from "@/hooks/useMounted";
import { shortenAddress } from "@/lib/utils";

interface TopBarProps {
  title: string;
  description?: string;
}

export function TopBar({ title, description }: TopBarProps) {
  const mounted = useMounted();
  const { wallet, isConnected, isCorrectNetwork, monBalance } = useWallet();

  const initials =
    mounted && wallet?.address
      ? wallet.address.slice(2, 4).toUpperCase()
      : "TT";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border-subtle)] bg-white/95 px-6 backdrop-blur-sm">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-semibold text-[var(--text-display)]">{title}</h1>
        {description && (
          <p className="truncate text-xs text-[var(--text-muted)]">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {mounted && isConnected && wallet && (
          <div className="hidden items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-inset)] px-3 py-1.5 sm:flex">
            <span
              className={`h-2 w-2 rounded-full ${isCorrectNetwork ? "bg-[var(--success)]" : "bg-[var(--warning)]"}`}
              aria-hidden
            />
            <span className="font-data text-xs text-[var(--text-heading)]">
              {shortenAddress(wallet.address, 4)}
            </span>
            {isCorrectNetwork && monBalance !== null && (
              <span className="font-data text-xs font-medium text-[var(--text-muted)]">
                {monBalance.toFixed(2)} MON
              </span>
            )}
          </div>
        )}

        <div
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface-muted)] text-xs font-semibold text-[var(--text-heading)]"
          title={mounted ? wallet?.address : undefined}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
