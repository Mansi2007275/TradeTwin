import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { MarketSnapshot } from "@/lib/types";
import { buildSimulationRoundsFromPrices } from "./build-simulation-rounds";
import type { DailyPricePoint, PriceDataCache, PriceDataResult } from "./types";

const COIN_ID = "ethereum";
const VS_CURRENCY = "usd";
const DAYS = 90;
const CACHE_FILE = path.join(process.cwd(), "data", "coingecko-eth-usd.json");

interface CoinGeckoMarketChart {
  prices: [number, number][];
  total_volumes: [number, number][];
}

function getCoinGeckoConfig(): { baseUrl: string; headers: Record<string, string> } {
  const apiKey = process.env.COINGECKO_API_KEY?.trim();

  if (!apiKey) {
    return {
      baseUrl: "https://api.coingecko.com/api/v3",
      headers: { Accept: "application/json" },
    };
  }

  const useProApi = process.env.COINGECKO_USE_PRO_API !== "false";
  if (useProApi) {
    return {
      baseUrl: "https://pro-api.coingecko.com/api/v3",
      headers: {
        Accept: "application/json",
        "x-cg-pro-api-key": apiKey,
      },
    };
  }

  return {
    baseUrl: "https://api.coingecko.com/api/v3",
    headers: {
      Accept: "application/json",
      "x-cg-demo-api-key": apiKey,
    },
  };
}

function normalizeChartResponse(payload: CoinGeckoMarketChart): DailyPricePoint[] {
  const volumeByTs = new Map<number, number>();
  for (const [ts, volume] of payload.total_volumes ?? []) {
    volumeByTs.set(ts, volume);
  }

  return payload.prices.map(([timestamp, price]) => ({
    timestamp,
    price: Math.round(price * 100) / 100,
    volume: Math.round(volumeByTs.get(timestamp) ?? 0),
  }));
}

async function readCacheFile(): Promise<PriceDataCache | null> {
  try {
    const raw = await readFile(CACHE_FILE, "utf8");
    const parsed = JSON.parse(raw) as PriceDataCache;
    if (parsed.source !== "coingecko") return null;
    if (!Array.isArray(parsed.prices) || parsed.prices.length === 0) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

async function writeCacheFile(cache: PriceDataCache): Promise<void> {
  await mkdir(path.dirname(CACHE_FILE), { recursive: true });
  await writeFile(CACHE_FILE, JSON.stringify(cache, null, 2), "utf8");
}

async function fetchFromCoinGecko(): Promise<PriceDataCache> {
  const { baseUrl, headers } = getCoinGeckoConfig();
  const url = new URL(`coins/${COIN_ID}/market_chart`, `${baseUrl.replace(/\/$/, "")}/`);
  url.searchParams.set("vs_currency", VS_CURRENCY);
  url.searchParams.set("days", String(DAYS));
  url.searchParams.set("interval", "daily");

  const response = await fetch(url.toString(), {
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `CoinGecko request failed (${response.status}): ${body.slice(0, 200)}`,
    );
  }

  const payload = (await response.json()) as CoinGeckoMarketChart;
  const prices = normalizeChartResponse(payload);

  if (prices.length === 0) {
    throw new Error("CoinGecko returned an empty price series");
  }

  return {
    fetchedAt: new Date().toISOString(),
    coinId: COIN_ID,
    vsCurrency: VS_CURRENCY,
    source: "coingecko",
    prices,
  };
}

async function loadOrFetchPriceData(forceRefresh = false): Promise<PriceDataResult> {
  if (!forceRefresh) {
    const cached = await readCacheFile();
    if (cached) {
      return { cache: cached, fromCache: true };
    }
  }

  try {
    const fresh = await fetchFromCoinGecko();
    try {
      await writeCacheFile(fresh);
    } catch (writeError) {
      console.warn("[priceDataService] Cache write skipped (read-only FS):", writeError);
    }
    return { cache: fresh, fromCache: false };
  } catch (error) {
    console.warn("[priceDataService] CoinGecko fetch failed:", error);

    const stale = await readCacheFile();
    if (stale) {
      return { cache: stale, fromCache: true };
    }

    throw new Error(
      "Live CoinGecko price data is required. Check COINGECKO_API_KEY in .env and try again.",
    );
  }
}

export const priceDataService = {
  async getHistoricalDailyPrices(forceRefresh = false): Promise<PriceDataResult> {
    return loadOrFetchPriceData(forceRefresh);
  },

  async getPriceSeries(forceRefresh = false): Promise<DailyPricePoint[]> {
    const { cache } = await loadOrFetchPriceData(forceRefresh);
    return cache.prices;
  },

  async getSimulationMarketRounds(forceRefresh = false): Promise<MarketSnapshot[]> {
    const { cache } = await loadOrFetchPriceData(forceRefresh);
    return buildSimulationRoundsFromPrices(cache.prices);
  },

  getCacheFilePath(): string {
    return CACHE_FILE;
  },
};
