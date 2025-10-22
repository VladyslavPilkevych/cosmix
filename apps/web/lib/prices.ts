"use client";
import { useQuery } from "@tanstack/react-query";

type Map = Record<string, number>;
export function usePrices(ids: string[], vs: string) {
  const key = ["prices", ids.sort().join(","), vs] as const;
  return useQuery({
    queryKey: key,
    staleTime: 60_000,
    queryFn: async () => {
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(",")}&vs_currencies=${vs}`;
      const r = await fetch(url);
      if (!r.ok) throw new Error("Price fetch failed");
      const json = await r.json();
      const out: Map = {};
      for (const id of ids) out[id] = json[id]?.[vs.toLowerCase()] ?? 0;
      return out;
    },
  });
}
