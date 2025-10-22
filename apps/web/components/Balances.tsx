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
  Divider,
  Stack,
} from "@chakra-ui/react";
import {
  Card,
  Stat,
  CosmosAssetIcon,
  useFiatCurrency,
  formatFiat,
  formatAmount,
} from "@ui";
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
import { getErc20Balances, Token } from "../lib/erc20";
import { usePrices } from "../lib/prices";

const TOKENS_MAINNET: Token[] = [
  {
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    symbol: "USDC",
    decimals: 6,
    coingeckoId: "usd-coin",
  },
  {
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    symbol: "USDT",
    decimals: 6,
    coingeckoId: "tether",
  },
  {
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    symbol: "DAI",
    decimals: 18,
    coingeckoId: "dai",
  },
];

// для оценки Cosmos главного denom
const COINGECKO_BY_DENOM: Record<string, string> = {
  OSMO: "osmosis",
  ATOM: "cosmos",
};

export function Balances() {
  // palette
  const headingColor = useColorModeValue("gray.800", "whiteAlpha.900");
  const labelColor = useColorModeValue("gray.500", "gray.400");
  const tableHeadColor = useColorModeValue("gray.500", "gray.400");
  const tableBorder = useColorModeValue("gray.200", "whiteAlpha.200");
  const mutedText = useColorModeValue("gray.500", "gray.500");
  const spinnerColor = useColorModeValue("gray.600", "gray.200");
  const selectBg = useColorModeValue("white", "gray.800");
  const selectBorder = useColorModeValue("gray.200", "whiteAlpha.300");
  const selectHoverBg = useColorModeValue("gray.50", "whiteAlpha.100");

  // ---- EVM ----
  const { address, chainId } = useAccount();
  const { data: evm, isLoading: evmLoading } = useQuery({
    queryKey: ["evm-balance", address, chainId],
    queryFn: async () =>
      address
        ? getEthBalance(address as `0x${string}`, chainId ?? undefined)
        : null,
    enabled: !!address,
  });

  // ---- Cosmos ----
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
    if (savedAddr && hasKeplr) {
      connectKeplr(cosmosChain)
        .then(({ address }) => {
          setCosmosAddress(address);
          localStorage.setItem("cosmosAddress", address);
        })
        .catch(() => {});
    }
  }, [cosmosChain, hasKeplr]);

  const {
    data: cosmosMain,
    isLoading: cosmosLoadingMain,
    refetch: refetchCosmos,
  } = useQuery({
    queryKey: ["cosmos-balance", cosmosAddress, cosmosChain.chainId],
    queryFn: async () =>
      cosmosAddress ? getCosmosBalance(cosmosAddress, cosmosChain) : null,
    enabled: !!cosmosAddress,
  });

  const { data: cosmosAll, isLoading: cosmosLoadingAll } = useQuery({
    queryKey: ["cosmos-balances-all", cosmosAddress, cosmosChain.chainId],
    queryFn: async () =>
      cosmosAddress ? getCosmosAllBalances(cosmosAddress, cosmosChain) : [],
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

  // ---- Pricing / totals ----
  const { fiat, setFiat } = useFiatCurrency();
  const priceIds = [
    "ethereum",
    "usd-coin",
    "tether",
    "dai",
    COINGECKO_BY_DENOM[cosmosChain.displayDenom] || "", // osmosis/cosmos если доступно
  ].filter(Boolean);
  const { data: prices = {} } = usePrices(priceIds, fiat);

  const [erc20, setErc20] = React.useState<
    { symbol: string; amount: number; coingeckoId?: string }[]
  >([]);
  React.useEffect(() => {
    (async () => {
      if (!address || !chainId) return setErc20([]);
      if (chainId === 1) {
        const list = await getErc20Balances(
          address as `0x${string}`,
          chainId,
          TOKENS_MAINNET,
        );
        setErc20(list);
      } else setErc20([]); // расширим позже
    })().catch(() => setErc20([]));
  }, [address, chainId]);

  const ethFiat =
    (evm?.ether ? Number(evm.ether) : 0) * (prices["ethereum"] ?? 0);
  const erc20Fiat = erc20.reduce(
    (s, t) => s + t.amount * (t.coingeckoId ? (prices[t.coingeckoId] ?? 0) : 0),
    0,
  );
  const cosmosMainFiat = cosmosMain?.amount
    ? cosmosMain.amount *
      (prices[COINGECKO_BY_DENOM[cosmosChain.displayDenom]] ?? 0)
    : 0;

  const evmSubtotal = ethFiat + erc20Fiat;
  const cosmosSubtotal = cosmosMainFiat;
  const totalFiat = evmSubtotal + cosmosSubtotal;

  return (
    <Stack spacing={4}>
      <Card>
        <HStack justify="space-between" align="start">
          <VStack align="start" spacing={0.5}>
            <Text fontSize="sm" color={labelColor}>
              Total portfolio
            </Text>
            <Text fontSize="2xl" fontWeight="bold">
              {formatFiat(totalFiat, fiat)}
            </Text>
            <Text fontSize="xs" color={mutedText}>
              {`Includes: EVM (ETH + ERC-20) and Cosmos main denom (${cosmosChain.displayDenom}).`}
            </Text>
          </VStack>
          <HStack>
            <Text fontSize="xs" color={labelColor}>
              {"Currency"}
            </Text>
            <Select
              size="xs"
              value={fiat}
              onChange={(e) => setFiat(e.target.value as any)}
              maxW="90px"
              bg={selectBg}
              borderColor={selectBorder}
              _hover={{ bg: selectHoverBg }}
            >
              <option value="USD">{"USD"}</option>
              <option value="EUR">{"EUR"}</option>
            </Select>
          </HStack>
        </HStack>
      </Card>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
        {/* EVM */}
        <Card>
          <VStack align="start" spacing={3} w="full">
            <HStack justify="space-between" w="full">
              <Text fontSize="sm" color={labelColor}>
                {"EVM"}
              </Text>
              <Text fontSize="sm" color={labelColor}>
                Subtotal:{" "}
                <Box as="span" fontWeight="semibold" color={headingColor}>
                  {formatFiat(evmSubtotal, fiat)}
                </Box>
              </Text>
            </HStack>

            <Box color={headingColor}>
              {evmLoading ? (
                <Spinner color={spinnerColor} />
              ) : (
                <Stat label="ETH balance" value={evm?.ether ?? "—"} />
              )}
            </Box>

            <Divider />

            <Table
              size="sm"
              variant="simple"
              sx={{ "th, td": { borderColor: tableBorder } }}
            >
              <Thead>
                <Tr>
                  <Th color={tableHeadColor}>{"TOKEN"}</Th>
                  <Th isNumeric color={tableHeadColor}>
                    {"AMOUNT"}
                  </Th>
                  <Th isNumeric color={tableHeadColor}>
                    {fiat}
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {erc20.length === 0 ? (
                  <Tr>
                    <Td colSpan={3}>
                      <Text color={mutedText} fontSize="sm">
                        {"No ERC-20 tokens."}
                      </Text>
                    </Td>
                  </Tr>
                ) : (
                  erc20.map((t) => (
                    <Tr key={t.symbol}>
                      <Td>
                        <Text>{t.symbol}</Text>
                      </Td>
                      <Td isNumeric>{formatAmount(t.amount)}</Td>
                      <Td isNumeric>
                        {formatFiat(
                          t.amount *
                            (t.coingeckoId ? (prices[t.coingeckoId] ?? 0) : 0),
                          fiat,
                        )}
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </VStack>
        </Card>

        {/* Cosmos */}
        <Card>
          <VStack align="start" spacing={3} w="full">
            <HStack w="full" justify="space-between">
              <Text fontSize="sm" color={labelColor}>
                {"Cosmos"}
              </Text>
              <HStack>
                <Text fontSize="sm" color={labelColor}>
                  {"Subtotal: "}
                  <Box as="span" fontWeight="semibold" color={headingColor}>
                    {formatFiat(cosmosSubtotal, fiat)}
                  </Box>
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
                  <option value={OSMOSIS_TESTNET.chainId}>
                    {"Osmosis Testnet"}
                  </option>
                  <option value={COSMOS_HUB.chainId}>
                    {"Cosmos Hub (mainnet)"}
                  </option>
                </Select>
              </HStack>
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

                <Text fontSize="xs" color={mutedText}>
                  {`Pricing: ${cosmosChain.displayDenom} via CoinGecko (${COINGECKO_BY_DENOM[cosmosChain.displayDenom] ?? "n/a"}). Testnet balances shown at mainnet reference price.`}
                </Text>

                <Divider />

                {cosmosLoadingAll ? (
                  <Skeleton height="120px" w="100%" />
                ) : (
                  <TableContainer w="full">
                    <Table
                      size="sm"
                      variant="simple"
                      sx={{ "th, td": { borderColor: tableBorder } }}
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
    </Stack>
  );
}
