"use client";
import { useQuery } from "@tanstack/react-query";

export type ListToken = {
  address: `0x${string}`;
  symbol: string;
  decimals: number;
  coingeckoId?: string;
};

const DEFAULT_LISTS: Record<number, string[]> = {
  1: [
    "https://gateway.ipfs.io/ipns/tokens.uniswap.org",
    "https://tokens.coingecko.com/uniswap/all.json",
  ],
  11155111: [
    "/tokenlists/sepolia.json"
  ],
};

export function useTokenList(chainId: number | undefined) {
  return useQuery({
    queryKey: ["tokenlist", chainId],
    enabled: !!chainId,
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    queryFn: async () => {
      if (!chainId) return [] as ListToken[];
      const urls = DEFAULT_LISTS[chainId] ?? [];
      const merged: Record<string, ListToken> = {};
      for (const url of urls) {
        try {
          const r = await fetch(url, { cache: "force-cache" });
          if (!r.ok) continue;
          const j = await r.json();
          const arr: any[] = j.tokens ?? j;
          for (const t of arr) {
            if ((t.chainId ?? chainId) !== chainId) continue;
            const addr = (t.address as string).toLowerCase() as `0x${string}`;
            merged[addr] = {
              address: addr,
              symbol: t.symbol,
              decimals: t.decimals ?? 18,
              coingeckoId: t.extensions?.coingeckoId ?? t.coingeckoId,
            };
          }
        } catch {}
      }
      const out = Object.values(merged);
      out.sort((a, b) => (a.address > b.address ? 1 : -1));
      return out;
    },
    select: (data) => data,
  });
}
