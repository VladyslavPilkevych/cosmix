"use client";

import { Box, Heading } from "@chakra-ui/react";
import { Balances } from "../components/Balances";

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
