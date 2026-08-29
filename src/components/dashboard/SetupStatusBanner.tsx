"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { MotionItem } from "@/components/layout/PageContainer";

interface HealthChecks {
  coingecko?: { ok: boolean; detail: string };
  monadscan?: { ok: boolean; detail: string };
  prices?: { ok: boolean; detail: string };
}

export function SetupStatusBanner() {
  const [checks, setChecks] = useState<HealthChecks | null>(null);

  useEffect(() => {
    fetch("/api/health", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setChecks(data.checks ?? null))
      .catch(() => setChecks(null));
  }, []);

  if (!checks || checks.monadscan?.ok) return null;

  return (
    <MotionItem>
      <Card variant="ghost" padding="md" hover={false}>
        <p className="text-sm font-medium text-[var(--warning)]">Setup required for full analysis</p>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Add a free{" "}
          <a
            href="https://etherscan.io/apis"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Etherscan API key
          </a>{" "}
          as <code className="text-xs">MONADSCAN_API_KEY</code> in your <code className="text-xs">.env</code>
          , then restart <code className="text-xs">npm run dev</code>. Without it, wallet transfers
          may not load and your Twin will stay in low-data mode.
        </p>
      </Card>
    </MotionItem>
  );
}
