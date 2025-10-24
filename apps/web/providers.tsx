"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { CacheProvider } from "@chakra-ui/next-js";
import { ChakraProvider, extendTheme, useColorMode } from "@chakra-ui/react";
import { http, WagmiProvider } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import {
  darkTheme,
  getDefaultConfig,
  lightTheme,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "@cosmix/ui";

const theme = extendTheme({
  config: {
    initialColorMode: "system",
    useSystemColorMode: true,
  },
});

const queryClient = new QueryClient();

export const wagmiConfig = getDefaultConfig({
  appName: "Cosmix",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: true,
});

function RKThemeBridge({ children }: { children: React.ReactNode }) {
  const { colorMode } = useColorMode();
  const locale = "en-US"; // todo: create more different locales

  return (
    <RainbowKitProvider
      theme={colorMode === "dark" ? darkTheme() : lightTheme()}
      locale={locale}
    >
      {children}
    </RainbowKitProvider>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CacheProvider>
      <ChakraProvider theme={theme}>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <ToastProvider>
              <RKThemeBridge>{children}</RKThemeBridge>
            </ToastProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </ChakraProvider>
    </CacheProvider>
  );
}
