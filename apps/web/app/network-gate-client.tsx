"use client";
import * as React from "react";
import { toastRpcError, useToast, NetworkGate } from "@ui";
import type { EvmChain } from "@ui";
import { SUPPORTED_EVM } from "../config/chains";

export default function NetworkGateClient({
  children,
  preferredIndex = 0,
  supported = SUPPORTED_EVM,
}: {
  children: React.ReactNode;
  preferredIndex?: number;
  supported?: EvmChain[];
}) {
  const { push } = useToast();
  return (
    <NetworkGate
      supported={supported}
      preferredIndex={preferredIndex}
      onRpcError={(err, retry) => toastRpcError(push, err, retry)}
    >
      {children}
    </NetworkGate>
  );
}
