"use client";

import { useEffect, useState } from "react";
import { EvmChain, EthereumProvider } from '@cosmix/sdk';

export function hexChainId(id: number) {
  return "0x" + id.toString(16);
}

export function useEvmNetwork(supported: EvmChain[]) {
  const [currentChainId, setCurrentChainId] = useState<number | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(true);

  useEffect(() => {
    const eth = (window as any).ethereum as EthereumProvider | undefined;
    if (!eth) return;

    let mounted = true;
    (async () => {
      try {
        const idHex = await eth.request({ method: "eth_chainId" });
        const id = parseInt(String(idHex), 16);
        if (!mounted) return;
        setCurrentChainId(id);
        setIsSupported(!!supported.find((c) => c.chainId === id));
      } catch {
        () => {};
      }
    })();

    const onChainChanged = (idHex: string) => {
      const id = parseInt(String(idHex), 16);
      setCurrentChainId(id);
      setIsSupported(!!supported.find((c) => c.chainId === id));
    };
    eth.on?.("chainChanged", onChainChanged);
    return () => eth.removeListener?.("chainChanged", onChainChanged);
  }, [supported]);

  const switchTo = async (target: EvmChain) => {
    const eth = (window as any).ethereum as EthereumProvider | undefined;
    if (!eth) throw new Error("No EVM wallet detected");

    try {
      await eth.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hexChainId(target.chainId) }],
      });
    } catch (switchErr: any) {
      if (
        switchErr?.code === 4902 ||
        /Unrecognized/i.test(String(switchErr?.message))
      ) {
        await eth.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: hexChainId(target.chainId),
              chainName: target.name,
              nativeCurrency: target.nativeCurrency,
              rpcUrls: target.rpcUrls,
              blockExplorerUrls: target.blockExplorerUrls,
            },
          ],
        });
        await eth.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: hexChainId(target.chainId) }],
        });
      } else {
        throw switchErr;
      }
    }
  };

  return { currentChainId, isSupported, switchTo } as const;
}
