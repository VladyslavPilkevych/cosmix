"use client";
import * as React from "react";
import {
  HStack,
  Button,
  IconButton,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  useToast,
  Box,
  Badge,
  useColorModeValue,
  Divider,
} from "@chakra-ui/react";
import { Copy as CopyIcon, ChevronDown } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  connectKeplr,
  COSMOS_HUB,
  OSMOSIS_TESTNET,
  type CosmosChainMeta,
} from "@cosmix/sdk";

export default function WalletPanel() {
  const toast = useToast();

  const panelBg       = useColorModeValue("white", "gray.800");
  const panelBorder   = useColorModeValue("gray.200", "whiteAlpha.300");
  const textColor     = useColorModeValue("gray.800", "whiteAlpha.900");
  const subtleText    = useColorModeValue("gray.500", "gray.400");
  const ghostHoverBg  = useColorModeValue("gray.50", "whiteAlpha.100");
  const menuBg        = useColorModeValue("white", "gray.800");
  const menuBorder    = useColorModeValue("gray.200", "whiteAlpha.300");
  const menuItemHover = useColorModeValue("gray.50", "whiteAlpha.100");

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const [hasKeplr, setHasKeplr] = React.useState(false);
  React.useEffect(() => {
    if (!mounted) return;
    setHasKeplr(!!(window as any).keplr);
  }, [mounted]);

  const [chain, setChain] = React.useState<CosmosChainMeta>(OSMOSIS_TESTNET);
  const [addr, setAddr] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!mounted) return;
    const saved = localStorage.getItem("cosmosChainId");
    if (saved === COSMOS_HUB.chainId) setChain(COSMOS_HUB);
    if (saved === OSMOSIS_TESTNET.chainId) setChain(OSMOSIS_TESTNET);

    const savedAddr = localStorage.getItem("cosmosAddress");
    if (savedAddr && (window as any).keplr) {
      connectKeplr(chain)
        .then(({ address }) => {
          setAddr(address);
          localStorage.setItem("cosmosAddress", address);
        })
        .catch(() => {});
    }
  }, [mounted]); // eslint-disable-line

  const onConnect = async () => {
    try {
      const { address } = await connectKeplr(chain);
      setAddr(address);
      localStorage.setItem("cosmosAddress", address);
    } catch (e: any) {
      toast({
        status: "error",
        title: e?.message ?? "Failed to connect Keplr",
      });
    }
  };

  const onDisconnect = () => {
    setAddr(null);
    localStorage.removeItem("cosmosAddress");
  };

  const onCopy = async () => {
    if (!addr) return;
    await navigator.clipboard.writeText(addr);
    toast({ status: "success", title: "Cosmos address copied" });
  };

  if (!mounted) {
    return (
      <HStack spacing={3}>
        <ConnectButton chainStatus="icon" showBalance={false} />
        <Button size="sm" variant="outline" isDisabled>
          {"Connecting..."}
        </Button>
      </HStack>
    );
  }

  return (
    <HStack spacing={3}>
      <ConnectButton chainStatus="icon" showBalance={false} />

      {!hasKeplr ? (
        <Button
          as="a"
          href="https://www.keplr.app/download"
          target="_blank"
          rel="noreferrer"
          size="sm"
          variant="outline"
        >
          {"Install Keplr"}
        </Button>
      ) : !addr ? (
        <Button onClick={onConnect} size="sm" variant="outline">
          {"Connect Keplr"}
        </Button>
      ) : (
        <HStack
          as={Box}
          px={3}
          py={2}
          rounded="xl"
          bg={panelBg}
          border="1px solid"
          borderColor={panelBorder}
          shadow="sm"
          spacing={2}
        >
          <Badge variant="subtle" colorScheme="purple">
            {"COSMOS"}
          </Badge>

          <Text fontWeight="medium" color={textColor}>
            {addr.slice(0, 6)}…{addr.slice(-4)}
          </Text>

          <Tooltip label="Copy address">
            <IconButton
              aria-label="Copy"
              icon={<CopyIcon size={16} />}
              size="xs"
              variant="ghost"
              _hover={{ bg: ghostHoverBg }}
              onClick={onCopy}
            />
          </Tooltip>

          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="More"
              icon={<ChevronDown size={16} />}
              size="xs"
              variant="ghost"
              _hover={{ bg: ghostHoverBg }}
            />
            <MenuList
              bg={menuBg}
              borderColor={menuBorder}
              shadow="lg"
              minW="210px"
              py={1}
            >
              <MenuItem
                onClick={() => {
                  setChain(OSMOSIS_TESTNET);
                  localStorage.setItem("cosmosChainId", OSMOSIS_TESTNET.chainId);
                }}
                _hover={{ bg: menuItemHover }}
              >
                {"Use Osmosis Testnet"}
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setChain(COSMOS_HUB);
                  localStorage.setItem("cosmosChainId", COSMOS_HUB.chainId);
                }}
                _hover={{ bg: menuItemHover }}
              >
                {"Use Cosmos Hub (mainnet)"}
              </MenuItem>

              <Divider my={1} borderColor={menuBorder} />

              <MenuItem onClick={onDisconnect} _hover={{ bg: menuItemHover }} color={subtleText}>
                {"Disconnect Keplr"}
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      )}
    </HStack>
  );
}
