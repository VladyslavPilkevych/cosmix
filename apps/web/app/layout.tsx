import "../styles/globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Cosmix",
  description: "Open-source cross-chain dashboard",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
