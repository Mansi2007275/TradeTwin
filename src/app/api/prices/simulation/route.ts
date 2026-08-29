import { NextResponse } from "next/server";
import { priceDataService } from "@/lib/prices/priceDataService";

export async function GET() {
  try {
    const [rounds, priceResult] = await Promise.all([
      priceDataService.getSimulationMarketRounds(),
      priceDataService.getHistoricalDailyPrices(),
    ]);

    return NextResponse.json({
      rounds,
      meta: {
        priceSource: priceResult.cache.source,
        fetchedAt: priceResult.cache.fetchedAt,
        fromCache: priceResult.fromCache,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load market data";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
