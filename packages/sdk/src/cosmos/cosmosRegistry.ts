"use client";
import { useQuery } from "@tanstack/react-query";

export type CosmosAssetMeta = {
  base: string;
  symbol: string;
  decimals: number;
  coingeckoId?: string;
  icon?: string;
};

export function useCosmosAssets(chainId: string) {
  return useQuery({
    queryKey: ["cosmos-registry", chainId],
    staleTime: 6 * 60 * 60 * 1000,
    queryFn: async (): Promise<Record<string, CosmosAssetMeta>> => {
      const repo = chainId.includes("osmosis") ? "osmosis" : "cosmoshub";
      const url = `https://raw.githubusercontent.com/cosmos/chain-registry/master/${repo}/assetlist.json`;
      const r = await fetch(url, { cache: "no-store" });
      const j = await r.json();
      const out: Record<string, CosmosAssetMeta> = {};
      for (const a of j.assets ?? []) {
        const display = a.display || a.symbol || a.name || "";
        const displayUnit =
          (a.denom_units ?? []).find((u: any) => u.denom === a.display) ||
          (a.denom_units ?? [])[0];
        const img = a.logo_URIs?.png || a.logo_URIs?.svg;
        out[a.base] = {
          base: a.base,
          symbol: display.toUpperCase(),
          decimals: displayUnit?.exponent ?? 6,
          coingeckoId: a.coingecko_id,
          icon: img,
        };
      }
      return out;
    },
  });
}

export function formatCosmosAmount(
  amount: string | number,
  base: string,
  map: Record<string, CosmosAssetMeta>,
) {
  const meta = map[base];
  if (!meta) return { text: String(amount), symbol: base.toUpperCase() };
  const n = typeof amount === "number" ? amount : Number(amount);
  const val = n / 10 ** meta.decimals;
  return { text: val.toFixed(6), symbol: meta.symbol, meta };
}
