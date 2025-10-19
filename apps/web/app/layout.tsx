import "./globals.css";
import type { Metadata } from "next";
import Providers from "./providers";
import { Header } from '@ui';
import WalletPanel from "../components/WalletPanel";

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
          <Header right={<WalletPanel />} />
          {children}
        </Providers>
      </body>
    </html>
  );
}
