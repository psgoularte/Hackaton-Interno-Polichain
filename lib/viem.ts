import { createPublicClient, http } from "viem";
import { hardhat, sepolia } from "viem/chains";

// Altere para usar a rede desejada (ex: hardhat ou sepolia)
const chain = process.env.NEXT_PUBLIC_CHAIN === "sepolia" ? sepolia : hardhat;

export const publicClient = createPublicClient({
  chain,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL),
});
