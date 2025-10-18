"use client";

import * as React from "react";
import NextLink from "next/link";
import { Box, Flex, HStack, Link, Spacer, Text } from "@chakra-ui/react";

type HeaderProps = {
  right?: React.ReactNode;
};

export function Header({ right }: HeaderProps) {
  return (
    <Box as="header" px={4} py={3} borderBottom="1px solid #eee" bg="white">
      <Flex align="center" gap={4}>
        <HStack spacing={4}>
          <Text fontWeight="bold">{"Cosmix"}</Text>
          <HStack spacing={3}>
            <Link as={NextLink} href="/">
              {"Home"}
            </Link>
            <Link as={NextLink} href="/grants">
              {"Grants"}
            </Link>
            <Link as={NextLink} href="/subscriptions">
              {"Subscriptions"}
            </Link>
          </HStack>
        </HStack>
        <Spacer />
        {right}
      </Flex>
    </Box>
  );
}
