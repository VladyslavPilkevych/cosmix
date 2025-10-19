"use client";
import { IconButton, Tooltip, useColorMode } from "@chakra-ui/react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggleButton() {
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === "dark";
  return (
    <Tooltip label={isDark ? "Switch to light mode" : "Switch to dark mode"}>
      <IconButton
        aria-label="Toggle color mode"
        size="sm"
        variant="ghost"
        onClick={toggleColorMode}
        icon={isDark ? <Sun size={16} /> : <Moon size={16} />}
      />
    </Tooltip>
  );
}
