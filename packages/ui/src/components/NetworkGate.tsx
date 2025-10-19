"use client";

import React from "react";
import { EvmChain, useEvmNetwork } from "../hooks/useEvmNetwork";

export function NetworkGate({
  supported,
  preferredIndex = 0,
  children,
  onRpcError,
}: {
  supported: EvmChain[];
  preferredIndex?: number;
  children: React.ReactNode;
  onRpcError?: (err: unknown, retry?: () => void) => void;
}) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const { currentChainId, isSupported, switchTo } = useEvmNetwork(supported);
  const target = supported[preferredIndex];

  if (!mounted)
    return (
      <div className="rounded-2xl border p-4 bg-white">{"Loading network..."}</div>
    );
  if (isSupported) return <>{children}</>;

  return (
    <div className="rounded-2xl border p-4 flex items-center gap-3 bg-amber-50">
      <div className="grow">
        <div className="font-semibold">{"Unsupported network"}</div>
        <div className="text-sm opacity-80">
          {currentChainId ? (
            <>
              {`You are connected to chain ID ${currentChainId}. Please switch to ${target.name} (ID ${target.chainId}).`}
            </>
          ) : (
            <>
              {`Please connect your EVM wallet and switch to ${target.name} (ID ${target.chainId}).`}
            </>
          )}
        </div>
      </div>
      <button
        className="px-3 py-2 rounded-xl border shadow bg-white hover:bg-slate-50"
        onClick={async () => {
          try {
            await switchTo(target);
          } catch (err) {
            onRpcError?.(err, () => switchTo(target));
          }
        }}
      >
        {`Switch to ${target.name}`}
      </button>
    </div>
  );
}
