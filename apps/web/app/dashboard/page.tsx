"use client";

import React from "react";
import { Box, Heading } from "@chakra-ui/react";
import { Balances } from "@/features/wallet/Balances";

export default function Home() {
  return (
    <Box p={6}>
      <Heading size="md" mb={4}>
        {"Overview"}
      </Heading>
      <Balances />
    </Box>
  );
}
