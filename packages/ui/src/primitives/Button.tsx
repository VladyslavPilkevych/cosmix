import { useColorModeValue } from "@chakra-ui/react";
import * as React from "react";

export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const border = useColorModeValue("gray.200", "whiteAlpha.200");
  return (
    <button
      {...props}
      style={{ padding: 8, borderRadius: 12, border: `1px solid ${border}` }}
    />
  );
}
