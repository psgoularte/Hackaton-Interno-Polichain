import { hardhat, mainnet, sepolia } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

const hardhatChain = {
  id: 31337, // Chain ID padrão do Hardhat
  name: "Hardhat",
  network: "hardhat",
  nativeCurrency: {
    decimals: 18,
    name: "Ethereum",
    symbol: "ETH",
  },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] }, // RPC padrão do Hardhat
  },
  blockExplores: {
    default: { name: "Hardhat", http: ["http://localhost:8545"] },
  },
  testnet: true,
} as const;

export const config = getDefaultConfig({
  appName: "Meu App Web3",
  projectId: "05163c13184a2c903892854830ae6b2a", //ID do seu projeto, lembrar de atualizar
  chains: [sepolia, hardhat],
  ssr: true,
});
