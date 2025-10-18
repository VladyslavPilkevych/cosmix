"use client";

import { Box, Button, Heading } from "@chakra-ui/react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { connectKeplr } from "@sdk/cosmos/keplr";
import { Balances } from "../components/Balances";

export default function Home() {
  return (
    <Box p={6}>
      <Heading size="md" mb={4}>
        Overview
      </Heading>
      <Balances />
    </Box>
  );
}
