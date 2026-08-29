export interface DailyPricePoint {
  timestamp: number;
  price: number;
  volume: number;
}

export interface PriceDataCache {
  fetchedAt: string;
  coinId: string;
  vsCurrency: string;
  source: "coingecko";
  prices: DailyPricePoint[];
}

export interface PriceDataResult {
  cache: PriceDataCache;
  fromCache: boolean;
}
