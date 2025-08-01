export const CONFIG = {
  RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545",
  FACTORY_ADDRESS: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707" as const,
} as const;
