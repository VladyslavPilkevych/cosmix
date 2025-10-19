import type { Keplr } from "@keplr-wallet/types";
import { StargateClient, type Coin } from "@cosmjs/stargate";

export type CosmosChainMeta = {
  chainId: string;
  rpc: string;
  bech32Prefix: string;
  baseDenom: string;
  displayDenom: string;
  decimals: number;
};

export const OSMOSIS_TESTNET: CosmosChainMeta = {
  chainId: "osmo-test-5",
  rpc: "https://rpc.testnet.osmosis.zone",
  bech32Prefix: "osmo",
  baseDenom: "uosmo",
  displayDenom: "OSMO",
  decimals: 6,
};

export const COSMOS_HUB: CosmosChainMeta = {
  chainId: "cosmoshub-4",
  rpc:
    (typeof window !== "undefined" &&
      (window as any)?.__COSMOS_RPC__) ||
    process.env.NEXT_PUBLIC_COSMOS_RPC ||
    "https://rpc.cosmos.directory/cosmoshub",
  bech32Prefix: "cosmos",
  baseDenom: "uatom",
  displayDenom: "ATOM",
  decimals: 6,
};

export const COSMOS_CHAINS: Record<string, CosmosChainMeta> = {
  "cosmoshub-4": COSMOS_HUB,
  "osmo-test-5": OSMOSIS_TESTNET,
};

declare global {
  interface Window {
    keplr?: Keplr;
    getOfflineSignerAuto?: (chainId: string) => any;
  }
}

export async function connectKeplr(chain: CosmosChainMeta = COSMOS_HUB) {
  if (!window.keplr) {
    throw new Error("Keplr not found. Install the Keplr extension.");
  }
  await window.keplr.enable(chain.chainId);

  const signer = await window.getOfflineSignerAuto!(chain.chainId);
  const accounts = await signer.getAccounts();
  const address = accounts[0]?.address;
  if (!address) throw new Error("No accounts in Keplr");

  return { address, signer };
}

export async function getCosmosBalance(
  address: string,
  chain: CosmosChainMeta = COSMOS_HUB
) {
  const client = await StargateClient.connect(chain.rpc);
  const bal = await client.getBalance(address, chain.baseDenom);
  const amount =
    bal?.amount ? Number(bal.amount) / 10 ** chain.decimals : 0;

  return { amount, denom: chain.displayDenom };
}

export async function getCosmosAllBalances(
  address: string,
  chain: CosmosChainMeta = COSMOS_HUB
) {
  const client = await StargateClient.connect(chain.rpc);
  const balances: readonly Coin[] = await client.getAllBalances(address);
  return balances.map((c) => {
    const isBase = c.denom === chain.baseDenom;
    const amount = isBase
      ? Number(c.amount) / 10 ** chain.decimals
      : Number(c.amount);
    const denom = isBase ? chain.displayDenom : c.denom;
    return { amount, denom };
  });
}
