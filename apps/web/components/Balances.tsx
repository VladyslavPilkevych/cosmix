"use client";
import * as React from "react";
import { SimpleGrid, VStack, Spinner, Button, Text, HStack, Select } from "@chakra-ui/react";
import { Card, Stat } from "@ui";
import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import {
  connectKeplr,
  COSMOS_HUB,
  getCosmosBalance,
  getEthBalance,
  OSMOSIS_TESTNET,
  CosmosChainMeta,
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

  const [cosmosChain, setCosmosChain] =
    React.useState<CosmosChainMeta>(OSMOSIS_TESTNET);
  const [cosmosAddress, setCosmosAddress] = React.useState<string | null>(null);

  React.useEffect(() => {
    const saved = localStorage.getItem("cosmosChainId");
    if (saved === COSMOS_HUB.chainId) setCosmosChain(COSMOS_HUB);
    if (saved === OSMOSIS_TESTNET.chainId) setCosmosChain(OSMOSIS_TESTNET);
  }, []);
  React.useEffect(() => {
    localStorage.setItem("cosmosChainId", cosmosChain.chainId);
  }, [cosmosChain]);

  const { data: cosmos, isLoading: cosmosLoading, refetch: refetchCosmos } = useQuery({
    queryKey: ["cosmos-balance", cosmosAddress, cosmosChain.chainId],
    queryFn: async () => {
      if (!cosmosAddress) return null;
      return getCosmosBalance(cosmosAddress, cosmosChain);
    },
    enabled: !!cosmosAddress,
  });

  const onConnectKeplr = async () => {
    try {
      const { address } = await connectKeplr(cosmosChain);
      setCosmosAddress(address);
      refetchCosmos();
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
        <VStack align="start" gap={3} w="full">
          <HStack w="full">
            <Text fontSize="sm" color="gray.500">{"Cosmos Balance"}</Text>
            <Select
              size="sm"
              maxW="220px"
              value={cosmosChain.chainId}
              onChange={(e) =>
                setCosmosChain(e.target.value === OSMOSIS_TESTNET.chainId ? OSMOSIS_TESTNET : COSMOS_HUB)
              }
            >
              <option value={OSMOSIS_TESTNET.chainId}>{"Osmosis Testnet"}</option>
              <option value={COSMOS_HUB.chainId}>{"Cosmos Hub (mainnet)"}</option>
            </Select>
          </HStack>

          {!cosmosAddress ? (
            <Button onClick={onConnectKeplr} variant="outline" size="sm">
              {"Connect Keplr"}
            </Button>
          ) : cosmosLoading ? (
            <Spinner />
          ) : (
            <Stat
              label={`${cosmosChain.displayDenom} on ${cosmosChain.chainId}`}
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
