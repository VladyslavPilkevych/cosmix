"use client";
import * as React from "react";
import { HStack, Button, Text } from "@chakra-ui/react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { connectKeplr } from "@sdk";

export function WalletBar() {
  const { isConnected, address } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const [keplrAddr, setKeplrAddr] = React.useState<string | null>(null);

  return (
    <HStack spacing={2}>
      {!isConnected ? (
        <Button
          size="sm"
          onClick={() => connect({ connector: injected() })}
          isLoading={isPending}
        >
          {"Connect MetaMask"}
        </Button>
      ) : (
        <Button size="sm" variant="outline" onClick={() => disconnect()}>
          {`${address?.slice(0, 6)}… Disconnect`}
        </Button>
      )}

      <Button
        size="sm"
        variant="outline"
        onClick={async () => {
          try {
            const res = await connectKeplr("cosmoshub-4");
            setKeplrAddr(res.address);
            alert(`Keplr: ${res.address}`);
          } catch (e: any) {
            alert(e?.message ?? "Keplr connection failed");
          }
        }}
      >
        {"Keplr"}
      </Button>
      {keplrAddr && <Text fontSize="xs">{`${keplrAddr.slice(0, 10)}…`}</Text>}
    </HStack>
  );
}
