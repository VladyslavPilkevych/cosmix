import "./globals.css";
import type { Metadata } from "next";
import Providers from "./providers";
import { Header } from '@ui';
import { ConnectButton } from "@rainbow-me/rainbowkit";

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
          <Header right={<ConnectButton />} />
          {children}
        </Providers>
      </body>
    </html>
  );
}
