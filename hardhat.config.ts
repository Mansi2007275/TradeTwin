import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-viem";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    monadTestnet: {
      type: "http",
      url: "https://testnet-rpc.monad.xyz/",
      chainId: 10143,
      accounts: process.env.DEPLOYER_PRIVATE_KEY
        ? [process.env.DEPLOYER_PRIVATE_KEY]
        : [],
    },
  },
};

export default config;
