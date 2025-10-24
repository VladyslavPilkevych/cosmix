import { Address } from "viem";

export type EvmChainId = 1 | 11155111;

export type EvmTx = {
  hash: string;
  blockNumber: number;
  timestamp: number;
  from: Address;
  to?: Address | null;
  valueWei: string;
  tokenSymbol?: string;
  tokenDecimals?: number;
  direction: "in" | "out" | "self" | "unknown";
  explorerUrl: string;
  kind: "native" | "erc20";
};

export type EvmPage = {
  items: EvmTx[];
  page: number;
  hasMore: boolean;
};

const ETHERSCAN_API_BY_CHAIN: Record<EvmChainId, string> = {
  1: "https://api.etherscan.io/api",
  11155111: "https://api-sepolia.etherscan.io/api",
};

const EXPLORER_TX_BY_CHAIN: Record<EvmChainId, string> = {
  1: "https://etherscan.io/tx/",
  11155111: "https://sepolia.etherscan.io/tx/",
};

const DEFAULT_PAGE_SIZE = 25;

async function fetchNativeTxs(params: {
  chainId: EvmChainId;
  address: Address;
  page: number;
  offset: number;
  apiKey?: string;
}) {
  const { chainId, address, page, offset, apiKey } = params;
  const url = new URL(ETHERSCAN_API_BY_CHAIN[chainId]);
  url.searchParams.set("module", "account");
  url.searchParams.set("action", "txlist");
  url.searchParams.set("address", address);
  url.searchParams.set("page", String(page));
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("sort", "desc");
  if (apiKey) url.searchParams.set("apikey", apiKey);

  const r = await fetch(url.toString());
  if (!r.ok) throw new Error(`Etherscan txlist HTTP ${r.status}`);
  const data = await r.json();
  if (data.status === "0" && data.message !== "No transactions found") {
    throw new Error(`Etherscan txlist error: ${data.result ?? data.message}`);
  }
  const list: any[] = data.result ?? [];

  return list.map((t) => ({
    kind: "native" as const,
    hash: t.hash,
    blockNumber: Number(t.blockNumber),
    timestamp: Number(t.timeStamp),
    from: t.from as Address,
    to: (t.to as Address) ?? null,
    valueWei: t.value, // string
  }));
}

async function fetchErc20Txs(params: {
  chainId: EvmChainId;
  address: Address;
  page: number;
  offset: number;
  apiKey?: string;
}) {
  const { chainId, address, page, offset, apiKey } = params;
  const url = new URL(ETHERSCAN_API_BY_CHAIN[chainId]);
  url.searchParams.set("module", "account");
  url.searchParams.set("action", "tokentx");
  url.searchParams.set("address", address);
  url.searchParams.set("page", String(page));
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("sort", "desc");
  if (apiKey) url.searchParams.set("apikey", apiKey);

  const r = await fetch(url.toString());
  if (!r.ok) throw new Error(`Etherscan tokentx HTTP ${r.status}`);
  const data = await r.json();
  if (data.status === "0" && data.message !== "No transactions found") {
    throw new Error(`Etherscan tokentx error: ${data.result ?? data.message}`);
  }
  const list: any[] = data.result ?? [];

  return list.map((t) => ({
    kind: "erc20" as const,
    hash: t.hash,
    blockNumber: Number(t.blockNumber),
    timestamp: Number(t.timeStamp),
    from: t.from as Address,
    to: (t.to as Address) ?? null,
    valueWei: t.value,
    tokenSymbol: t.tokenSymbol as string | undefined,
    tokenDecimals: Number(t.tokenDecimal ?? 18),
  }));
}

export async function getEvmTxPage(params: {
  chainId: EvmChainId;
  address: Address;
  page?: number;
  pageSize?: number;
  apiKey?: string;
}): Promise<EvmPage> {
  const {
    chainId,
    address,
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
    apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY,
  } = params;

  const [nativeRaw, erc20Raw] = await Promise.all([
    fetchNativeTxs({ chainId, address, page, offset: pageSize, apiKey }),
    fetchErc20Txs({ chainId, address, page, offset: pageSize, apiKey }),
  ]);

  const combined = [...nativeRaw, ...erc20Raw].map((t) => {
    const direction =
      t.from?.toLowerCase() === address.toLowerCase() &&
      t.to?.toLowerCase() === address.toLowerCase()
        ? "self"
        : t.from?.toLowerCase() === address.toLowerCase()
          ? "out"
          : t.to?.toLowerCase() === address.toLowerCase()
            ? "in"
            : "unknown";

    const explorerUrl = `${EXPLORER_TX_BY_CHAIN[chainId]}${t.hash}`;

    return {
      ...t,
      direction,
      explorerUrl,
    } as EvmTx;
  });

  combined.sort(
    (a, b) => b.timestamp - a.timestamp || b.blockNumber - a.blockNumber,
  );

  const hasMore = nativeRaw.length === pageSize || erc20Raw.length === pageSize;

  return {
    items: combined,
    page,
    hasMore,
  };
}
