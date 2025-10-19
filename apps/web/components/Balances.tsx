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
  useColorModeValue,
  Box,
} from "@chakra-ui/react";
import { Card, Stat, CosmosAssetIcon } from "@ui";
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
  const headingColor = useColorModeValue("gray.800", "whiteAlpha.900");
  const labelColor = useColorModeValue("gray.500", "gray.400");
  const tableHeadColor = useColorModeValue("gray.500", "gray.400");
  const tableBorder = useColorModeValue("gray.200", "whiteAlpha.200");
  const mutedText = useColorModeValue("gray.500", "gray.500");
  const spinnerColor = useColorModeValue("gray.600", "gray.200");
  const selectBg = useColorModeValue("white", "gray.800");
  const selectBorder = useColorModeValue("gray.200", "whiteAlpha.300");
  const selectHoverBg = useColorModeValue("gray.50", "whiteAlpha.100");

  // EVM balance
  const { address, chainId } = useAccount();
  const { data: evm, isLoading: evmLoading } = useQuery({
    queryKey: ["evm-balance", address, chainId],
    queryFn: async () => {
      if (!address) return null;
      return getEthBalance(address as `0x${string}`, chainId ?? undefined);
    },
    enabled: !!address,
  });

  // Cosmos balance
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
        <VStack align="start" spacing={2}>
          {evmLoading ? (
            <Spinner color={spinnerColor} />
          ) : (
            <Box color={headingColor}>
              <Stat label="EVM Balance (ETH)" value={evm?.ether ?? "—"} />
            </Box>
          )}
        </VStack>
      </Card>

      <Card>
        <VStack align="start" gap={3} w="full">
          <HStack w="full" justify="space-between">
            <Text fontSize="sm" color={labelColor}>
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
              bg={selectBg}
              borderColor={selectBorder}
              _hover={{ bg: selectHoverBg }}
              _focusVisible={{
                borderColor: "blue.400",
                boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)",
              }}
            >
              <option value={OSMOSIS_TESTNET.chainId}>{"Osmosis Testnet"}</option>
              <option value={COSMOS_HUB.chainId}>{"Cosmos Hub (mainnet)"}</option>
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
              colorScheme="blue"
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
                <Box color={headingColor}>
                  <Stat
                    label={`${cosmosChain.displayDenom} on ${cosmosChain.chainId}`}
                    value={
                      cosmosMain
                        ? `${cosmosMain.amount.toFixed(6)} ${cosmosMain.denom}`
                        : "—"
                    }
                  />
                </Box>
              )}

              {cosmosLoadingAll ? (
                <Skeleton height="120px" w="100%" />
              ) : (
                <TableContainer w="full">
                  <Table
                    size="sm"
                    variant="simple"
                    sx={{
                      "th, td": { borderColor: tableBorder },
                    }}
                  >
                    <Thead>
                      <Tr>
                        <Th color={tableHeadColor}>{"ASSET"}</Th>
                        <Th isNumeric color={tableHeadColor}>
                          {"AMOUNT"}
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {(cosmosAll ?? []).length === 0 ? (
                        <Tr>
                          <Td colSpan={2}>
                            <Text fontSize="sm" color={mutedText}>
                              {"No assets found."}
                            </Text>
                          </Td>
                        </Tr>
                      ) : (
                        cosmosAll!.map((c, i) => (
                          <Tr key={i}>
                            <Td>
                              <HStack spacing={2}>
                                <CosmosAssetIcon
                                  chain={cosmosChain.chainId}
                                  symbol={c.denom}
                                  size={20}
                                />
                                <Text>{c.denom}</Text>
                              </HStack>
                            </Td>
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
