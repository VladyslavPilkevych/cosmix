"use client";
import * as React from "react";
import {
  SimpleGrid,
  VStack,
  Spinner,
  Button,
  Text,
  HStack,
  Select,
  Skeleton,
  TableContainer,
  Table,
  Thead,
  Th,
  Tr,
  Tbody,
  Td,
} from "@chakra-ui/react";
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
  getCosmosAllBalances,
} from "@sdk";

export function Balances() {
  // EVM Balance
  const { address, chainId } = useAccount();
  const { data: evm, isLoading: evmLoading } = useQuery({
    queryKey: ["evm-balance", address, chainId],
    queryFn: async () => {
      if (!address) return null;
      return getEthBalance(address as `0x${string}`, chainId ?? undefined);
    },
    enabled: !!address,
  });

  // Cosmos Balance
  const hasKeplr =
    typeof window !== "undefined" &&
    typeof (window as any).keplr !== "undefined";

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

  React.useEffect(() => {
    const savedAddr = localStorage.getItem("cosmosAddress");
    const hasKeplr =
      typeof window !== "undefined" &&
      typeof (window as any).keplr !== "undefined";
    if (savedAddr && hasKeplr) {
      connectKeplr(cosmosChain)
        .then(({ address }) => {
          setCosmosAddress(address);
          localStorage.setItem("cosmosAddress", address);
        })
        .catch(() => {});
    }
  }, [cosmosChain]);

  const {
    data: cosmosMain,
    isLoading: cosmosLoadingMain,
    refetch: refetchCosmos,
  } = useQuery({
    queryKey: ["cosmos-balance", cosmosAddress, cosmosChain.chainId],
    queryFn: async () => {
      if (!cosmosAddress) return null;
      return getCosmosBalance(cosmosAddress, cosmosChain);
    },
    enabled: !!cosmosAddress,
  });

  const { data: cosmosAll, isLoading: cosmosLoadingAll } = useQuery({
    queryKey: ["cosmos-balances-all", cosmosAddress, cosmosChain.chainId],
    queryFn: async () => {
      if (!cosmosAddress) return [];
      return getCosmosAllBalances(cosmosAddress, cosmosChain);
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
          <HStack w="full" justify="space-between">
            <Text fontSize="sm" color="gray.500">
              {"Cosmos"}
            </Text>
            <Select
              size="sm"
              maxW="230px"
              value={cosmosChain.chainId}
              onChange={(e) =>
                setCosmosChain(
                  e.target.value === OSMOSIS_TESTNET.chainId
                    ? OSMOSIS_TESTNET
                    : COSMOS_HUB,
                )
              }
            >
              <option value={OSMOSIS_TESTNET.chainId}>
                {"Osmosis Testnet"}
              </option>
              <option value={COSMOS_HUB.chainId}>
                {"Cosmos Hub (mainnet)"}
              </option>
            </Select>
          </HStack>

          {!hasKeplr ? (
            <Button
              as="a"
              href="https://www.keplr.app/download"
              target="_blank"
              rel="noreferrer"
              size="sm"
              variant="solid"
            >
              {"Install Keplr"}
            </Button>
          ) : !cosmosAddress ? (
            <Button onClick={onConnectKeplr} variant="outline" size="sm">
              {"Connect Keplr"}
            </Button>
          ) : (
            <>
              {cosmosLoadingMain ? (
                <Skeleton height="28px" w="180px" />
              ) : (
                <Stat
                  label={`${cosmosChain.displayDenom} on ${cosmosChain.chainId}`}
                  value={
                    cosmosMain
                      ? `${cosmosMain.amount.toFixed(6)} ${cosmosMain.denom}`
                      : "—"
                  }
                />
              )}

              {cosmosLoadingAll ? (
                <Skeleton height="120px" w="100%" />
              ) : (
                <TableContainer w="full">
                  <Table size="sm" variant="simple">
                    <Thead>
                      <Tr>
                        <Th>{"Asset"}</Th>
                        <Th isNumeric>{"Amount"}</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {(cosmosAll ?? []).length === 0 ? (
                        <Tr>
                          <Td colSpan={2}>
                            <Text fontSize="sm" color="gray.500">
                              {
                                "No assets found."
                              }
                            </Text>
                          </Td>
                        </Tr>
                      ) : (
                        cosmosAll!.map((c, i) => (
                          <Tr key={i}>
                            <Td>{c.denom}</Td>
                            <Td isNumeric>
                              {Number(c.amount).toLocaleString()}
                            </Td>
                          </Tr>
                        ))
                      )}
                    </Tbody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </VStack>
      </Card>
    </SimpleGrid>
  );
}
