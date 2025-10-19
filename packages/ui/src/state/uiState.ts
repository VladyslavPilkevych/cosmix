"use client";

import { useEffect } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

type Theme = "light" | "dark" | "system";

export function useThemeState() {
  const { value, setValue } = useLocalStorage<Theme>("ui.theme", "system");
  useEffect(() => {
    const root = document.documentElement;
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = value === "system" ? (prefersDark ? "dark" : "light") : value;
    root.dataset.theme = theme; // hook for your CSS frameworks
  }, [value]);
  return { theme: value, setTheme: setValue } as const;
}

export function useTableOpenState(tableKey: string) {
  type MapT = Record<string, boolean>;
  const { value, setValue } = useLocalStorage<MapT>("ui.tables.openState", {});

  const isOpen = !!value[tableKey];
  const setOpen = (open: boolean) =>
    setValue((prev) => ({ ...prev, [tableKey]: open }));
  const toggle = () => setOpen(!isOpen);

  return { isOpen, setOpen, toggle } as const;
}
