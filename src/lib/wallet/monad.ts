import { monadTestnet } from "@/config/wagmi";
import { MONAD_CHAIN_ID_HEX } from "@/config/wallet";
import { getMetaMaskProvider } from "@/lib/wallet/metamask";

export async function addMonadTestnetToMetaMask(): Promise<boolean> {
  const provider = getMetaMaskProvider();
  if (!provider) return false;

  try {
    await provider.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: MONAD_CHAIN_ID_HEX,
          chainName: monadTestnet.name,
          nativeCurrency: {
            name: monadTestnet.nativeCurrency.name,
            symbol: monadTestnet.nativeCurrency.symbol,
            decimals: monadTestnet.nativeCurrency.decimals,
          },
          rpcUrls: [monadTestnet.rpcUrls.default.http[0]],
          blockExplorerUrls: [monadTestnet.blockExplorers.default.url],
        },
      ],
    });
    return true;
  } catch {
    return false;
  }
}

export async function switchMetaMaskToMonad(): Promise<boolean> {
  const provider = getMetaMaskProvider();
  if (!provider) return false;

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: MONAD_CHAIN_ID_HEX }],
    });
    return true;
  } catch (err: unknown) {
    const code =
      typeof err === "object" && err !== null && "code" in err
        ? (err as { code: number }).code
        : null;
    if (code === 4902) {
      return addMonadTestnetToMetaMask();
    }
    return false;
  }
}
