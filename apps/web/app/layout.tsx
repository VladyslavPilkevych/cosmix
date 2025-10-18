export const metadata = { title: "Cosmix Web" };

import "./globals.css";
import Providers from "./providers";
import { WalletBar } from "../components/WalletBar";
import { Header } from '@ui';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Header right={<WalletBar />} />
          {children}
        </Providers>
      </body>
    </html>
  );
}
