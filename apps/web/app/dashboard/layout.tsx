import type { Metadata } from "next";
import { Header } from "@cosmix/ui";
import { ColorModeScript } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import Providers from "@/providers";
import WalletPanel from "@/features/wallet/WalletPanel";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
const NetworkGateClient = dynamic(
  () => import("@/features/network/network-gate-client"),
  {
    ssr: false,
  },
);

export const metadata: Metadata = {
  title: "Cosmix",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <ColorModeScript initialColorMode="system" />
      <Header
        right={
          <>
            <WalletPanel />
            <ThemeToggleButton />
          </>
        }
      />
      <NetworkGateClient preferredIndex={0}>{children}</NetworkGateClient>
    </Providers>
  );
}
