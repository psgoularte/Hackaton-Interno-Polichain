export const CONFIG = {
  RPC_URL:
    process.env.NODE_ENV === "development"
      ? "http://127.0.0.1:8545"
      : process.env.NEXT_PUBLIC_RPC_URL || "",
  FACTORY_ADDRESS: "0x8cb3971e1f69aF5e0536Cc1f0790D3DB7ccE1c5C" as const,
} as const;
