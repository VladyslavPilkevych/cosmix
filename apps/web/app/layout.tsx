import "./globals.css";
import type { Metadata } from "next";
import Providers from "./providers";
import { Header } from "@ui";
import WalletPanel from "../components/WalletPanel";
import { ColorModeScript } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import { ThemeToggleButton } from "../components/ThemeToggleButton";
const NetworkGateClient = dynamic(() => import("./network-gate-client"), {
  ssr: false,
});

export const metadata: Metadata = {
  title: "Cosmix",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
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
      </body>
    </html>
  );
}
