"use client";

import { useLocalStorage } from "../hooks/useLocalStorage";

export type Fiat = "USD" | "EUR";
export function useFiatCurrency() {
  const { value, setValue } = useLocalStorage<Fiat>("ui.fiat", "USD");
  return { fiat: value, setFiat: setValue } as const;
}
