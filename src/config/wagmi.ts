import { http, createConfig, createStorage, noopStorage } from "wagmi";
import { metaMask } from "wagmi/connectors";
import { defineChain } from "viem";

export const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://testnet-rpc.monad.xyz/"] },
  },
  blockExplorers: {
    default: {
      name: "Monad Explorer",
      url: "https://testnet.monadexplorer.com",
    },
  },
});

export const metaMaskConnector = metaMask({
  dappMetadata: {
    name: "TradeTwin",
    url: typeof window !== "undefined" ? window.location.origin : "https://tradetwin.app",
  },
});

export const wagmiConfig = createConfig({
  chains: [monadTestnet],
  connectors: [metaMaskConnector],
  transports: {
    [monadTestnet.id]: http("https://testnet-rpc.monad.xyz/"),
  },
  storage: createStorage({ storage: noopStorage }),
  ssr: true,
});
