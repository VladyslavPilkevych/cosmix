import * as React from "react";
import { Box, useColorModeValue } from "@chakra-ui/react";

export function Card({ children }: { children: React.ReactNode }) {
  const bg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("gray.200", "whiteAlpha.200");
  return (
    <Box
      border={`1px solid ${border}`}
      borderRadius="16px"
      p={4}
      bg={bg}
      boxShadow="sm"
    >
      {children}
    </Box>
  );
}
