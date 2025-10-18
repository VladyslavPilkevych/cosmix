import * as React from "react";
import { VStack, Text } from "@chakra-ui/react";

export function Stat({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <VStack spacing={0} align="start">
      <Text fontSize="sm" color="gray.500">
        {label}
      </Text>
      <Text fontSize="xl" fontWeight="semibold">
        {value}
      </Text>
    </VStack>
  );
}
