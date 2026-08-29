export function parseWalletError(error: unknown): string {
  if (!error) return "Something went wrong. Please try again.";

  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error !== null && "message" in error
        ? String((error as { message: unknown }).message)
        : String(error);

  const lower = message.toLowerCase();

  if (lower.includes("user rejected") || lower.includes("denied")) {
    return "Transaction rejected in your wallet.";
  }
  if (lower.includes("insufficient funds") || lower.includes("insufficient balance")) {
    return "Insufficient MON for gas on Monad Testnet.";
  }
  if (lower.includes("chain") && lower.includes("mismatch")) {
    return "Wrong network — switch to Monad Testnet (Chain ID 10143).";
  }
  if (lower.includes("wallet") && lower.includes("not found")) {
    return "No wallet detected. Install MetaMask or another Web3 wallet.";
  }
  if (lower.includes("achievement already recorded")) {
    return "This achievement is already recorded on-chain.";
  }
  if (lower.includes("network") || lower.includes("fetch")) {
    return "Network error — check your connection and try again.";
  }

  return message.length > 120 ? `${message.slice(0, 120)}…` : message;
}

export function isWalletInstalled(): boolean {
  if (typeof window === "undefined") return false;
  return typeof (window as Window & { ethereum?: unknown }).ethereum !== "undefined";
}
