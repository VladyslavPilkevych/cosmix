"use client";

import { useEffect, useMemo, useState } from "react";

type CosmosIconProps = {
  chain: string;
  symbol?: string;
  denomImage?: string;
  size?: number;
  registryBaseUrl?: string;
  className?: string;
};

const DEFAULT_BASE =
  "https://raw.githubusercontent.com/cosmos/chain-registry/master" as const;

const memoryOkCache = new Set<string>();

export function CosmosAssetIcon({
  chain,
  symbol,
  denomImage,
  size = 24,
  registryBaseUrl = DEFAULT_BASE,
  className,
}: CosmosIconProps) {
  const [src, setSrc] = useState<string | null>(null);

  const candidates = useMemo(() => {
    const guesses: string[] = [];
    const base = `${registryBaseUrl}/${chain}/images`;
    if (denomImage) guesses.push(`${base}/${denomImage}`);
    if (symbol)
      guesses.push(
        `${base}/${symbol.toLowerCase()}.png`,
        `${base}/${symbol.toLowerCase()}.svg`,
      );
    guesses.push(
      `${base}/${chain}.png`,
      `${base}/${chain}.svg`,
      `${base}/logo.png`,
      `${base}/token.png`,
    );
    return guesses;
  }, [chain, symbol, denomImage, registryBaseUrl]);
  useEffect(() => {
    let mounted = true;
    (async () => {
      for (const url of candidates) {
        const cacheKey = `cosmos.icon.ok:${url}`;
        if (
          memoryOkCache.has(cacheKey) ||
          localStorage.getItem(cacheKey) === "1"
        ) {
          if (mounted) setSrc(url);
          return;
        }
        try {
          const res = await fetch(url, { method: "HEAD" });
          if (res.ok) {
            memoryOkCache.add(cacheKey);
            localStorage.setItem(cacheKey, "1");
            if (mounted) setSrc(url);
            return;
          }
        } catch {() => {}}
      }
      if (mounted) setSrc(null);
    })();
    return () => {
      mounted = false;
    };
  }, [candidates]);
  if (!src) {
    return (
      <div
        className={
          "inline-flex items-center justify-center rounded-full bg-slate-200 " +
          (className ?? "")
        }
        style={{ width: size, height: size }}
        title={symbol || chain}
      >
        <span style={{ fontSize: Math.max(10, Math.floor(size * 0.45)) }}>
          {(symbol || chain).slice(0, 2).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={symbol || chain}
      width={size}
      height={size}
      className={`inline-block rounded-full ${className ?? ""}`}
    />
  );
}
