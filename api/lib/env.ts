import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    const errorMsg = `CRITICAL: Missing environment variable "${name}". Check Vercel Project Settings.`;
    console.error(errorMsg);
    // Don't throw if we are on Vercel to allow the app to boot and return a JSON error instead of a text crash
    if (!process.env.VERCEL) {
      throw new Error(errorMsg);
    }
  }
  return value ?? "";
}

export const env = {
  appId: required("APP_ID"),
  appSecret: required("APP_SECRET"),
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: required("DATABASE_URL"),
  kimiAuthUrl: required("KIMI_AUTH_URL") || "https://auth.kimi.com",
  kimiOpenUrl: required("KIMI_OPEN_URL") || "https://open.kimi.com",
  ownerUnionId: process.env.OWNER_UNION_ID ?? "",
  rpcUrl: process.env.RPC_URL || "https://rpc-amoy.polygon.technology",
  privateKey: process.env.PRIVATE_KEY || "",
  contractAddress: process.env.CONTRACT_ADDRESS || "",
};
