import { Balances } from "@/features/wallet/Balances";


export const metadata = { title: "Wallet - Cosmix" };

export default function WalletPage() {
  return (
    <>
      <h1 className="text-2xl mb-4">{"Wallet"}</h1>
      <Balances />
    </>
  );
}
