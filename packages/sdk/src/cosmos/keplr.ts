import type { Window as KeplrWindow } from "@keplr-wallet/types";
import { StargateClient } from "@cosmjs/stargate";

// Простейшая карта RPC по chainId
const RPC_BY_CHAIN: Record<string, string> = {
  "cosmoshub-4": "https://rpc.cosmos.network:443",
};

type KeplrWin = Window & KeplrWindow & {
  getOfflineSignerAuto?: (chainId: string) => any;
};

export async function connectKeplr(chainId: string) {
  const w = window as unknown as KeplrWin;
  if (!w.keplr) throw new Error("Keplr not found. Install the extension.");

  // enable всегда через w.keplr
  await w.keplr.enable(chainId);

  // Пытаемся использовать keplr.getOfflineSignerAuto, иначе fallback
  const getAuto =
    w.keplr.getOfflineSignerAuto?.bind(w.keplr) ??
    w.getOfflineSignerAuto?.bind(w) ??
    null;

  const offlineSigner = getAuto
    ? await getAuto(chainId)
    : w.keplr.getOfflineSigner(chainId);

  const accounts = await offlineSigner.getAccounts();
  const address = accounts[0]?.address;
  if (!address) throw new Error("No accounts in Keplr");

  return { address };
}

export async function getCosmosBalance(address: string, chainId: string) {
  const rpc = RPC_BY_CHAIN[chainId];
  if (!rpc) throw new Error(`RPC for ${chainId} is not configured`);
  const client = await StargateClient.connect(rpc);
  const balances = await client.getAllBalances(address);
  return balances; // массив Coin { denom, amount }
}
