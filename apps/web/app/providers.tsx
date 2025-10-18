"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { CacheProvider } from "@chakra-ui/next-js";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";

import { http, WagmiProvider } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";

import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const theme = extendTheme({});
const queryClient = new QueryClient();

const config = getDefaultConfig({
  appName: "Cosmix",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: true,
});

export default function Providers({ children }: { children: React.ReactNode }) {
  const locale = "en-US"; // todo: create more different locales

  return (
    <CacheProvider>
      <ChakraProvider theme={theme}>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider locale={locale}>{children}</RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </ChakraProvider>
    </CacheProvider>
  );
}
