import * as React from "react";
import { Box } from "@chakra-ui/react";

export function Card({ children }: { children: React.ReactNode }) {
  return (
    <Box
      border="1px solid #eee"
      borderRadius="16px"
      p={4}
      bg="white"
      boxShadow="sm"
    >
      {children}
    </Box>
  );
}
