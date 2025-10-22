"use client";

import { useMemo } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

export function useWatchlistEvm(chainId: number | null | undefined) {
  const key = chainId
    ? `ui.watchlist.evm.${chainId}`
    : `ui.watchlist.evm.unknown`;
  const { value, setValue } = useLocalStorage<Record<string, true>>(key, {});
  const isWatched = (addr: `0x${string}`) => !!value[addr.toLowerCase()];
  const toggle = (addr: `0x${string}`) =>
    setValue((v) => {
      const k = addr.toLowerCase();
      const next = { ...v };
      if (next[k]) delete next[k];
      else next[k] = true;
      return next;
    });
  const all = useMemo(() => Object.keys(value).sort(), [value]);
  return { isWatched, toggle, all } as const;
}
