"use client";

import { Box, useColorModeValue, Button } from "@chakra-ui/react";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ToastKind = "info" | "success" | "warning" | "error";

export type ToastItem = {
  id: string;
  title?: string;
  message: string;
  kind?: ToastKind;
  actionLabel?: string;
  onAction?: () => void;
  durationMs?: number;
};

const ToastCtx = createContext<{
  push: (t: Omit<ToastItem, "id">) => void;
} | null>(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider/>");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = (t: Omit<ToastItem, "id">) => {
    const id = Math.random().toString(36).slice(2);
    const item: ToastItem = { id, durationMs: 5000, kind: "info", ...t };
    setToasts((prev) => [...prev, item]);
  };

  const remove = (id: string) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

function ToastCard({ toast, onClose }: { toast: ToastItem; onClose: () => void }) {
  useEffect(() => {
    const id = setTimeout(onClose, toast.durationMs);
    return () => clearTimeout(id);
  }, [toast.durationMs, onClose]);

  const baseBg   = useColorModeValue("white", "gray.800");
  const baseBrd  = useColorModeValue("gray.200", "whiteAlpha.300");
  const errBg    = useColorModeValue("red.50", "red.900");
  const errBrd   = useColorModeValue("red.200", "red.700");
  const warnBg   = useColorModeValue("yellow.50", "yellow.900");
  const warnBrd  = useColorModeValue("yellow.200", "yellow.700");
  const succBg   = useColorModeValue("green.50", "green.900");
  const succBrd  = useColorModeValue("green.200", "green.700");

  const styles = useMemo(() => {
    switch (toast.kind) {
      case "error":   return { bg: errBg,  borderColor: errBrd  };
      case "warning": return { bg: warnBg, borderColor: warnBrd };
      case "success": return { bg: succBg, borderColor: succBrd };
      default:        return { bg: baseBg, borderColor: baseBrd };
    }
  }, [toast.kind, baseBg, baseBrd, errBg, errBrd, warnBg, warnBrd, succBg, succBrd]);

  return (
    <Box minW="280px" maxW="380px" borderWidth="1px" rounded="2xl" shadow="md" p={3} bg={styles.bg} borderColor={styles.borderColor}>
      {toast.title && <Box fontWeight="semibold" mb={1}>{toast.title}</Box>}
      <Box fontSize="sm" opacity={0.9}>{toast.message}</Box>
      <Box mt={2} display="flex" alignItems="center" gap={2}>
        {toast.actionLabel && toast.onAction && (
          <Button size="xs" variant="outline" onClick={() => { try { toast.onAction?.(); } finally { onClose(); } }}>
            {toast.actionLabel}
          </Button>
        )}
        <Button size="xs" variant="ghost" ml="auto" onClick={onClose}>{"Dismiss"}</Button>
      </Box>
    </Box>
  );
}


export function toastRpcError(
  push: (t: Omit<ToastItem, "id">) => void,
  err: unknown,
  retry?: () => void
) {
  const anyErr = err as any;
  const message = anyErr?.message || anyErr?.reason || anyErr?.code || "Unknown error";
  push({
    kind: "error",
    title: "Network / RPC error",
    message,
    actionLabel: retry ? "Retry" : undefined,
    onAction: retry,
  });
}
