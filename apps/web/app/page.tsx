"use client";

import { Button } from "@chakra-ui/react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { connectKeplr } from "@sdk/cosmos/keplr";

export default function Home() {
  const { isConnected, address } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Web3 Subscriptions — Web</h1>

      <section className="space-x-2">
        {!isConnected ? (
          <Button
            onClick={() => connect({ connector: injected() })}
            isLoading={isPending}
          >
            Connect MetaMask
          </Button>
        ) : (
          <Button variant="outline" onClick={() => disconnect()}>
            Disconnect ({address?.slice(0, 6)}…)
          </Button>
        )}

        <Button
          variant="outline"
          onClick={async () => {
            try {
              const res = await connectKeplr("cosmoshub-4");
              alert(`Keplr: ${res.address}`);
            } catch (e: any) {
              alert(e?.message ?? "Keplr connection failed");
            }
          }}
        >
          Connect Keplr (Cosmos)
        </Button>
      </section>
    </main>
  );
}
