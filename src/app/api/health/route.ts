import { NextResponse } from "next/server";
import { hasMonadscanApiKey } from "@/lib/trades/fetch-monadscan";
import { priceDataService } from "@/lib/prices/priceDataService";

export async function GET() {
  const checks: Record<string, { ok: boolean; detail: string }> = {};

  checks.coingecko = {
    ok: Boolean(process.env.COINGECKO_API_KEY?.trim()),
    detail: process.env.COINGECKO_API_KEY?.trim()
      ? "API key configured"
      : "Missing COINGECKO_API_KEY in .env",
  };

  checks.monadscan = {
    ok: hasMonadscanApiKey(),
    detail: hasMonadscanApiKey()
      ? "MONADSCAN_API_KEY configured (recommended for wallet history)"
      : "Optional MONADSCAN_API_KEY not set — RPC fallback used for transfers",
  };

  try {
    const rounds = await priceDataService.getSimulationMarketRounds();
    checks.prices = {
      ok: rounds.length >= 5,
      detail: `${rounds.length} simulation rounds available`,
    };
  } catch (error) {
    checks.prices = {
      ok: false,
      detail: error instanceof Error ? error.message : "Price fetch failed",
    };
  }

  const ok = checks.coingecko.ok && checks.prices.ok;

  return NextResponse.json(
    {
      status: ok ? "healthy" : "degraded",
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: ok ? 200 : 503 },
  );
}
