"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { hardhat, sepolia } from "wagmi/chains";

const hardhatChain = {
  id: 31337,
  name: "Hardhat",
  network: "hardhat",
  nativeCurrency: {
    decimals: 18,
    name: "Ethereum",
    symbol: "ETH",
  },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] },
  },
  blockExplorers: {
    default: { name: "Hardhat", url: "http://localhost:8545" },
  },
  testnet: true,
} as const;

export const config = getDefaultConfig({
  appName: "Meu App Web3",
  projectId: "25aacf32f3a69cb2accbbde68772321a",
  chains: [sepolia, hardhatChain],
  ssr: true,
});
export { hardhat };
