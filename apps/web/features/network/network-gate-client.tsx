"use client";
import * as React from "react";
import { toastRpcError, useToast } from "@cosmix/ui";
import { SUPPORTED_EVM, type EvmChain } from "@cosmix/sdk";
import { NetworkGate } from "./NetworkGate";

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
