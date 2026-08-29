import type { TradeSide } from "@/lib/types";
import type { Portfolio } from "./types";

export type DecisionVariant = TradeSide | "HALF_BUY" | "HALF_SELL";

export function portfolioValue(portfolio: Portfolio, price: number): number {
  return portfolio.cash + portfolio.eth * price;
}

export function createPortfolio(cash: number): Portfolio {
  return { cash, eth: 0 };
}

export function applyDecision(
  portfolio: Portfolio,
  decision: TradeSide,
  price: number,
): Portfolio {
  return applyDecisionVariant(portfolio, decision, price);
}

export function applyDecisionVariant(
  portfolio: Portfolio,
  variant: DecisionVariant,
  price: number,
): Portfolio {
  if (variant === "HALF_BUY" && portfolio.cash > 0 && price > 0) {
    const invest = portfolio.cash * 0.5;
    const ethBought = invest / price;
    return {
      cash: portfolio.cash - invest,
      eth: portfolio.eth + ethBought,
    };
  }

  if (variant === "HALF_SELL" && portfolio.eth > 0) {
    const sellEth = portfolio.eth * 0.5;
    return {
      cash: portfolio.cash + sellEth * price,
      eth: portfolio.eth - sellEth,
    };
  }

  if (variant === "BUY" && portfolio.cash > 0 && price > 0) {
    const ethBought = portfolio.cash / price;
    return { cash: 0, eth: portfolio.eth + ethBought };
  }

  if (variant === "SELL" && portfolio.eth > 0) {
    const cashFromSale = portfolio.eth * price;
    return { cash: portfolio.cash + cashFromSale, eth: 0 };
  }

  return { ...portfolio };
}

export function hasOpenPosition(portfolio: Portfolio): boolean {
  return portfolio.eth > 0;
}

export function exposureRatio(portfolio: Portfolio, price: number): number {
  const total = portfolioValue(portfolio, price);
  if (total <= 0) return 0;
  return (portfolio.eth * price) / total;
}

export function roundOutcome(
  before: number,
  after: number,
): "win" | "loss" | "neutral" {
  const delta = after - before;
  if (delta > 0.01) return "win";
  if (delta < -0.01) return "loss";
  return "neutral";
}
