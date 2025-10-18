"use client";
import * as React from "react";
import { SimpleGrid, VStack, Spinner, Button, Text } from "@chakra-ui/react";
import { Card, Stat } from "@ui";
import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import {
  connectKeplr,
  COSMOS_HUB,
  getCosmosBalance,
  getEthBalance,
} from "@sdk";

export function Balances() {
  const { address, chainId } = useAccount();

  const hasKeplr =
    typeof window !== "undefined" &&
    typeof (window as any).keplr !== "undefined";

  const { data: evm, isLoading: evmLoading } = useQuery({
    queryKey: ["evm-balance", address, chainId],
    queryFn: async () => {
      if (!address) return null;
      return getEthBalance(address as `0x${string}`, chainId ?? undefined);
    },
    enabled: !!address,
  });

  const [cosmosAddress, setCosmosAddress] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (cosmosAddress) localStorage.setItem("cosmosAddress", cosmosAddress);
  }, [cosmosAddress]);

  React.useEffect(() => {
    const saved = localStorage.getItem("cosmosAddress");
    if (saved) setCosmosAddress(saved);
  }, []);

  const {
    data: cosmos,
    isLoading: cosmosLoading,
    refetch: refetchCosmos,
  } = useQuery({
    queryKey: ["cosmos-balance", cosmosAddress],
    queryFn: async () => {
      if (!cosmosAddress) return null;
      return getCosmosBalance(cosmosAddress, COSMOS_HUB);
    },
    enabled: !!cosmosAddress,
  });

  const onConnectKeplr = async () => {
    try {
      const { address } = await connectKeplr(COSMOS_HUB);
      setCosmosAddress(address);
      setTimeout(() => refetchCosmos(), 0);
    } catch (e: any) {
      alert(e?.message ?? "Failed to connect Keplr");
    }
  };

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
        <VStack align="start" gap={2}>
          {!hasKeplr ? (
            <>
              <Text fontSize="sm" color="gray.500">
                {"Cosmos Balance"}
              </Text>
              <Button
                as="a"
                href="https://www.keplr.app/download"
                target="_blank"
                rel="noreferrer"
                variant="solid"
                size="sm"
              >
                {"Install Keplr"}
              </Button>
            </>
          ) : !cosmosAddress ? (
            <>
              <Text fontSize="sm" color="gray.500">
                {"Cosmos Balance"}
              </Text>
              <Button onClick={onConnectKeplr} variant="outline" size="sm">
                {"Connect Keplr"}
              </Button>
            </>
          ) : cosmosLoading ? (
            <Spinner />
          ) : (
            <Stat
              label="Cosmos Balance"
              value={
                cosmos ? `${cosmos.amount.toFixed(6)} ${cosmos.denom}` : "—"
              }
            />
          )}
        </VStack>
      </Card>
    </SimpleGrid>
  );
}
