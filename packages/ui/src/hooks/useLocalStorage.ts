"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const isBrowser = typeof window !== "undefined";
  const [value, setValue] = useState<T>(() => {
    if (!isBrowser) return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const keyRef = useRef(key);

  useEffect(() => {
    if (!isBrowser) return;
    try {
      window.localStorage.setItem(keyRef.current, JSON.stringify(value));
    } catch {}
  }, [isBrowser, value]);

  const update = useCallback((updater: T | ((prev: T) => T)) => {
    setValue((prev) =>
      typeof updater === "function" ? (updater as any)(prev) : updater, // todo: replace any
    );
  }, []);

  const reset = useCallback(() => setValue(initialValue), [initialValue]);

  return { value, setValue: update, reset } as const;
}
