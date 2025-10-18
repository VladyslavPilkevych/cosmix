"use client";
import * as React from "react";
import { SimpleGrid, VStack, Spinner } from "@chakra-ui/react";
import { Card, Stat } from "@ui";
import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { getEthBalance } from "@sdk";

export function Balances() {
  const { address, chainId } = useAccount();

  const { data: evm, isLoading: evmLoading } = useQuery({
    queryKey: ["evm-balance", address, chainId],
    queryFn: async () => {
      if (!address) return null;
      return getEthBalance(address as `0x${string}`, chainId ?? undefined);
    },
    enabled: !!address,
  });

  const { data: cosmos, isLoading: cosmosLoading } = useQuery({
    queryKey: ["cosmos-balance"],
    queryFn: async () => {
      // todo: save Keplr address
      return null as any;
    },
    enabled: false,
  });

  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
      <Card>
        <VStack align="start">
          {evmLoading ? (
            <Spinner />
          ) : (
            <Stat label="EVM Balance (ETH)" value={evm?.ether ?? "—"} />
          )}
        </VStack>
      </Card>

      <Card>
        <VStack align="start">
          {cosmosLoading ? (
            <Spinner />
          ) : (
            <Stat label="Cosmos Balance" value="(connect Keplr)" />
          )}
        </VStack>
      </Card>
    </SimpleGrid>
  );
}
