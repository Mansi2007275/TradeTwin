"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { shortenAddress } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { LiveIndicator } from "@/components/ui/StatusIndicators";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dna", label: "DNA" },
  { href: "/twin", label: "Twin" },
  { href: "/simulation", label: "Sim" },
  { href: "/results", label: "Results" },
];

function MetaMaskIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="16" height="16" aria-hidden>
      <path fill="#E17726" d="M21.5 2.5L13.5 8.5L15 4.5L21.5 2.5Z" />
      <path fill="#E27625" d="M2.5 2.5L10.3 8.6L9 4.5L2.5 2.5Z" />
      <path fill="#E27625" d="M18.2 17.2L16 21.5L21 23L22.5 17.3L18.2 17.2Z" />
      <path fill="#E27625" d="M1.5 17.3L3 23L8 21.5L5.8 17.2L1.5 17.3Z" />
      <path fill="#E27625" d="M7.5 10.5L6 12.5L11.5 12.8L11.3 6.8L7.5 10.5Z" />
      <path fill="#E27625" d="M16.5 10.5L12.6 6.7L12.5 12.8L18 12.5L16.5 10.5Z" />
      <path fill="#E27625" d="M8 21.5L12 19.5L9.5 17.2L8 21.5Z" />
      <path fill="#E27625" d="M16 21.5L14.5 17.2L12 19.5L16 21.5Z" />
    </svg>
  );
}

export function Header() {
  const pathname = usePathname();
  const {
    wallet,
    isConnected,
    isConnecting,
    isCorrectNetwork,
    isExpectedAccount,
    connectWallet,
    disconnectWallet,
    switchToExpectedWallet,
    monBalance,
  } = useWallet();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--surface-elevated)]/80 px-4 py-3 backdrop-blur-md sm:px-6">
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="opacity-90 transition-opacity hover:opacity-100">
            <Logo size="sm" />
          </Link>

          {isConnected && (
            <nav className="hidden items-center gap-0.5 md:flex">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <span
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors",
                      pathname === link.href
                        ? "bg-[var(--surface-inset)] text-[var(--text-display)]"
                        : "text-[var(--text-muted)] hover:text-[var(--text-heading)]",
                    )}
                  >
                    {link.label}
                  </span>
                </Link>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isConnected && wallet ? (
            <div className="flex items-center gap-3">
              {!isExpectedAccount && (
                <button
                  type="button"
                  onClick={switchToExpectedWallet}
                  className="hidden text-xs text-[var(--text-muted)] underline-offset-2 hover:underline sm:block"
                >
                  Switch wallet
                </button>
              )}
              <div className="hidden border-l border-[var(--border-subtle)] pl-3 sm:block">
                <div className="flex items-center gap-2">
                  <MetaMaskIcon />
                  <span className="font-data text-xs text-[var(--text-heading)]">
                    {shortenAddress(wallet.address, 4)}
                  </span>
                </div>
                {isCorrectNetwork && monBalance !== null ? (
                  <p className="font-data text-right text-xs font-semibold text-[var(--accent)]">
                    {monBalance.toFixed(2)} MON
                  </p>
                ) : (
                  <LiveIndicator
                    label={isCorrectNetwork ? "Connected" : "Wrong network"}
                    active={isCorrectNetwork}
                    className="justify-end"
                  />
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={disconnectWallet}>
                Disconnect
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={connectWallet} disabled={isConnecting}>
              <MetaMaskIcon className="mr-1" />
              {isConnecting ? "Connecting..." : "Connect"}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
