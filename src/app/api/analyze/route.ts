import { NextResponse } from "next/server";
import { isAddress } from "viem";
import { analyzeBehaviour } from "@/lib/analysis/engine";
import { computeTradingDNA } from "@/lib/dna/engine";
import { buildTwinProfile, normalizeTwinProfile } from "@/lib/twin";
import { fetchWalletTrades } from "@/lib/trades";
import { fetchWalletBalance } from "@/lib/trades/fetch-rpc";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const address = body?.address as string | undefined;

    if (!address || !isAddress(address)) {
      return NextResponse.json(
        { error: "Valid wallet address required" },
        { status: 400 },
      );
    }

    const { trades, source, transferCount, priceSource, transferHint } =
      await fetchWalletTrades(address);
    const monBalance = await fetchWalletBalance(address);
    const profile = analyzeBehaviour(trades, address, source);
    const dna = computeTradingDNA(profile);
    const twin = normalizeTwinProfile(buildTwinProfile(profile, dna, trades));

    return NextResponse.json({
      profile,
      dna,
      twin,
      trades,
      meta: {
        transferCount,
        source,
        monBalance,
        address,
        priceSource,
        hasOnChainHistory: transferCount > 0,
        transferHint,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
