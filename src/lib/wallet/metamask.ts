type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

export function getMetaMaskProvider(): EthereumProvider | null {
  if (typeof window === "undefined") return null;
  const eth = (window as Window & { ethereum?: EthereumProvider }).ethereum;
  return eth ?? null;
}

export async function getMetaMaskActiveAccount(): Promise<string | null> {
  const provider = getMetaMaskProvider();
  if (!provider) return null;

  try {
    const accounts = (await provider.request({
      method: "eth_accounts",
    })) as string[];
    return accounts[0] ?? null;
  } catch {
    return null;
  }
}

/** Opens MetaMask account picker and returns currently selected accounts. */
export async function openMetaMaskAccountPicker(): Promise<string[]> {
  const provider = getMetaMaskProvider();
  if (!provider) return [];

  try {
    await provider.request({
      method: "wallet_requestPermissions",
      params: [{ eth_accounts: {} }],
    });
    return (await provider.request({ method: "eth_accounts" })) as string[];
  } catch {
    return [];
  }
}

export async function requestMetaMaskAccounts(): Promise<string[]> {
  const provider = getMetaMaskProvider();
  if (!provider) return [];

  try {
    return (await provider.request({ method: "eth_requestAccounts" })) as string[];
  } catch {
    return [];
  }
}

export function subscribeMetaMaskAccountsChanged(
  handler: (accounts: string[]) => void,
): () => void {
  const provider = getMetaMaskProvider();
  if (!provider?.on) return () => {};

  const listener = (accounts: unknown) => {
    handler(Array.isArray(accounts) ? (accounts as string[]) : []);
  };

  provider.on("accountsChanged", listener);
  return () => provider.removeListener?.("accountsChanged", listener);
}
