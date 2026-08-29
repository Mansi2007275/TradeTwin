"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useWallet } from "@/hooks/useWallet";
import { useMounted } from "@/hooks/useMounted";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LandingBackground } from "@/components/landing/LandingBackground";
import { LandingConnectionStatus } from "@/components/landing/LandingConnectionStatus";
import { LandingHeroMark } from "@/components/landing/LandingHeroMark";
import { LandingHighlights } from "@/components/landing/LandingHighlights";
import { EXPECTED_WALLET } from "@/config/wallet";
import { shortenAddress } from "@/lib/utils";

const features = [
  {
    title: "Trading DNA",
    description:
      "Five behavioural scores derived from your on-chain history.",
    variant: "default" as const,
  },
  {
    title: "Your Twin",
    description:
      "An AI model that mirrors how you actually trade.",
    variant: "default" as const,
  },
  {
    title: "Risk-Free Sims",
    description:
      "Compete in historical market replays with virtual portfolios.",
    variant: "default" as const,
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay, ease: "easeOut" as const },
  }),
};

export default function LandingPage() {
  const mounted = useMounted();
  const {
    isConnected,
    isConnecting,
    connectWallet,
    hasWallet,
    isExpectedAccount,
    isCorrectNetwork,
    isSwitching,
    switchToMonad,
  } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (isConnected && isExpectedAccount && isCorrectNetwork) {
      router.replace("/dashboard");
    }
  }, [isConnected, isExpectedAccount, isCorrectNetwork, router]);

  return (
    <div className="relative flex min-h-screen flex-1 flex-col overflow-hidden bg-[var(--shell-bg)]">
      <LandingBackground />

      <section className="relative flex flex-1 flex-col items-center justify-center px-4 py-20 sm:py-28">
        <div className="relative z-10 mx-auto w-full max-w-4xl">
          <LandingConnectionStatus
            mounted={mounted}
            hasWallet={hasWallet}
            isConnected={isConnected}
            isConnecting={isConnecting}
            isExpectedAccount={isExpectedAccount}
            isCorrectNetwork={isCorrectNetwork}
          />

          <div className="landing-hero-block relative mx-auto max-w-3xl px-6 py-12 text-center text-[var(--ink)] sm:px-10 sm:py-16">
            <motion.div
              className="mb-6 flex justify-center"
              custom={0}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              <LandingHeroMark />
            </motion.div>

            <motion.h1
              className="type-display text-5xl leading-none sm:text-7xl"
              custom={0.1}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              Trade<span className="landing-wordmark-twin">Twin</span>
            </motion.h1>

            <motion.p
              className="mt-6 text-lg font-medium sm:text-xl"
              custom={0.2}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              The hardest trader to beat is yourself.
            </motion.p>

            <motion.p
              className="mx-auto mt-4 max-w-lg text-sm leading-relaxed opacity-90"
              custom={0.28}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              Connect MetaMask on Monad Testnet. TradeTwin reads your on-chain activity,
              builds your behavioural twin, and lets you compete in risk-free simulations.
            </motion.p>

            <motion.div
              className="mt-10 flex flex-col items-center gap-4"
              custom={0.36}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              {hasWallet === false ? (
                <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-inset)] px-6 py-4 text-sm text-[var(--text-muted)]">
                  MetaMask required —{" "}
                  <a
                    href="https://metamask.io/download/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[var(--accent)] underline underline-offset-2"
                  >
                    Install MetaMask
                  </a>
                </div>
              ) : mounted && isConnected && !isCorrectNetwork ? (
                <Button size="lg" onClick={switchToMonad} disabled={isSwitching}>
                  {isSwitching ? "Switching…" : "Switch to Monad Testnet"}
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="min-w-[260px]"
                >
                  {isConnecting ? "Opening MetaMask…" : "Connect My Wallet"}
                </Button>
              )}

              {mounted && isConnected && !isExpectedAccount && (
                <p className="text-xs text-[var(--warning)]">
                  Wrong account — select {shortenAddress(EXPECTED_WALLET, 6)} in MetaMask
                </p>
              )}

              {hasWallet !== false && (
                <div className="mt-2 w-full max-w-sm rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-inset)] px-4 py-3 text-left">
                  <p className="type-eyebrow">Registered wallet · 10143</p>
                  <p className="font-data mt-1 break-all text-xs text-[var(--text-muted)]">{EXPECTED_WALLET}</p>
                </div>
              )}
            </motion.div>
          </div>

          <LandingHighlights />
        </div>
      </section>

      <section className="relative border-t border-[var(--border-subtle)] bg-white px-4 py-16">
        <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-3">
          {features.map((feature, i) => (
            <Card key={feature.title} variant={feature.variant} padding="md" hover>
              <p className="type-eyebrow mb-2">0{i + 1}</p>
              <h3 className="type-display text-lg">{feature.title}</h3>
              <p className="mt-3 text-sm leading-relaxed opacity-90">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
