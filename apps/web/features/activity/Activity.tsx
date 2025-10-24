"use client";

import * as React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { CosmosAccount, CosmosTx, getCosmosTxPage, EvmChainId, EvmTx, getEvmTxPage } from "@cosmix/sdk";

type Props = {
  evm?: { address: `0x${string}`; chainId: EvmChainId };
  cosmos?: CosmosAccount;
  className?: string;
};

function formatAgo(tsSec: number) {
  if (!tsSec) return "";
  const diff = Date.now() / 1000 - tsSec;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function trimAddr(a?: string | null, len = 6) {
  if (!a) return "";
  if (a.length <= len * 2) return a;
  return `${a.slice(0, len)}…${a.slice(-len)}`;
}

export default function Activity({ evm, cosmos, className }: Props) {
  const {
    data: evmData,
    isLoading: evmLoading,
    isError: evmError,
    fetchNextPage: evmFetchNext,
    hasNextPage: evmHasNext,
    isFetchingNextPage: evmFetchingNext,
  } = useInfiniteQuery({
    enabled: Boolean(evm?.address && evm?.chainId),
    queryKey: ["evm:tx", evm?.chainId, evm?.address],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) =>
      getEvmTxPage({
        chainId: evm!.chainId,
        address: evm!.address,
        page: pageParam as number,
        pageSize: 25,
      }),
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  });

  const evmItems: EvmTx[] = React.useMemo(
    () => (evmData?.pages ?? []).flatMap((p) => p.items),
    [evmData]
  );

  const {
    data: cosmosData,
    isLoading: cosmosLoading,
    isError: cosmosError,
    fetchNextPage: cosmosFetchNext,
    hasNextPage: cosmosHasNext,
    isFetchingNextPage: cosmosFetchingNext,
  } = useInfiniteQuery({
    enabled: Boolean(cosmos?.address && cosmos?.lcdBaseUrl),
    queryKey: ["cosmos:tx", cosmos?.lcdBaseUrl, cosmos?.address],
    initialPageParam: { keySender: null as string | null, keyRecipient: null as string | null },
    queryFn: async ({ pageParam }) => {
      const { keySender, keyRecipient } = pageParam as { keySender: string | null; keyRecipient: string | null };
      const res = await getCosmosTxPage({
        account: cosmos!,
        nextKey: keySender,
        nextKeyRecipient: keyRecipient,
        limit: 30,
      });
      return res;
    },
    getNextPageParam: (last) => {
      const nextKey = last.nextKeySender || last.nextKeyRecipient;
      if (!nextKey) return undefined;
      return { keySender: last.nextKeySender ?? null, keyRecipient: last.nextKeyRecipient ?? null };
    },
    select: (data) => {
      const items = data.pages.flatMap((p) => p.page.items);
      const hasMore = Boolean(data.pages[data.pages.length - 1].page.hasMore);
      return { items, hasMore, raw: data };
    },
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  });

  const emptyAll =
    (!evm && !cosmos) ||
    ((evm && !evmLoading && !evmItems.length) && (cosmos && !cosmosLoading && !(cosmosData?.items?.length)));

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold mb-2">{"Activity"}</h3>

      {!evm && !cosmos && (
        <div className="text-sm text-neutral-500 border rounded-xl p-4">
          {`No accounts configured. Provide ${<code>{"evm"}</code>} and/or ${<code>{"cosmos"}</code>} props.`}
        </div>
      )}

      {evm && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">EVM ({trimAddr(evm.address)})</h4>
          </div>

          {evmLoading && (
            <div className="text-sm text-neutral-500 border rounded-xl p-4">{"Loading EVM transactions..."}</div>
          )}
          {evmError && (
            <div className="text-sm text-red-600 border rounded-xl p-4">{"Failed to load EVM transactions."}</div>
          )}
          {!evmLoading && !evmError && evmItems.length === 0 && (
            <div className="text-sm text-neutral-500 border rounded-xl p-4">{"No EVM activity yet."}</div>
          )}

          <ul className="space-y-2">
            {evmItems.map((tx) => (
              <li key={`${tx.hash}-${tx.kind}`} className="border rounded-xl p-3 hover:bg-neutral-50 transition">
                <div className="flex items-center justify-between">
                  <a href={tx.explorerUrl} target="_blank" rel="noreferrer" className="font-mono text-sm underline">
                    {trimAddr(tx.hash, 8)}
                  </a>
                  <span className="text-xs text-neutral-500">{formatAgo(tx.timestamp)}</span>
                </div>
                <div className="mt-1 text-sm flex flex-wrap gap-x-4 gap-y-1">
                  <span className="px-2 py-0.5 rounded-full text-xs border">
                    {tx.kind === "erc20" ? (tx.tokenSymbol ?? "ERC20") : "NATIVE"}
                  </span>
                  <span className="text-neutral-600">
                    {tx.direction === "in" ? "In" : tx.direction === "out" ? "Out" : tx.direction === "self" ? "Self" : "Unknown"}
                  </span>
                  <span className="text-neutral-600">
                    {`from ${trimAddr(tx.from)} ${(tx.to) ? <>to {trimAddr(tx.to)}</> : null}`}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          {evmHasNext && (
            <div className="mt-3">
              <button
                onClick={() => evmFetchNext()}
                className="px-3 py-2 rounded-lg border shadow-sm text-sm disabled:opacity-50"
                disabled={evmFetchingNext}
              >
                {evmFetchingNext ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </section>
      )}

      {cosmos && (
        <section>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">{`Cosmos (${trimAddr(cosmos.address)})`}</h4>
          </div>

          {cosmosLoading && (
            <div className="text-sm text-neutral-500 border rounded-xl p-4">{"Loading Cosmos transactions..."}</div>
          )}
          {cosmosError && (
            <div className="text-sm text-red-600 border rounded-xl p-4">{"Failed to load Cosmos transactions."}</div>
          )}
          {!cosmosLoading && !cosmosError && (!cosmosData || cosmosData.items.length === 0) && (
            <div className="text-sm text-neutral-500 border rounded-xl p-4">{"No Cosmos activity yet."}</div>
          )}

          <ul className="space-y-2">
            {(cosmosData?.items ?? []).map((tx: CosmosTx) => (
              <li key={tx.hash} className="border rounded-xl p-3 hover:bg-neutral-50 transition">
                <div className="flex items-center justify-between">
                  <a
                    href={tx.explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-sm underline"
                  >
                    {trimAddr(tx.hash, 8)}
                  </a>
                  <span className="text-xs text-neutral-500">{formatAgo(tx.timestamp)}</span>
                </div>
                <div className="mt-1 text-sm flex flex-wrap gap-x-4 gap-y-1">
                  {tx.typeUrl && <span className="px-2 py-0.5 rounded-full text-xs border">{tx.typeUrl.split(".").pop()}</span>}
                  {(tx.from || tx.to) && (
                    <span className="text-neutral-600">
                      {tx.from ? <>from {trimAddr(tx.from)} </> : null}
                      {tx.to ? <>to {trimAddr(tx.to)}</> : null}
                    </span>
                  )}
                  {tx.amount && <span className="text-neutral-700">{tx.amount} {tx.denom}</span>}
                </div>
              </li>
            ))}
          </ul>

          {cosmosData?.hasMore && (
            <div className="mt-3">
              <button
                onClick={() => cosmosFetchNext()}
                className="px-3 py-2 rounded-lg border shadow-sm text-sm disabled:opacity-50"
                disabled={cosmosFetchingNext}
              >
                {cosmosFetchingNext ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </section>
      )}

      {emptyAll && (
        <div className="text-sm text-neutral-500 border rounded-xl p-4 mt-4">
          {"No recent activity."}
        </div>
      )}
    </div>
  );
}
