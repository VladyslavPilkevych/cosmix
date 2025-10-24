export type EthereumProvider = {
  request: (args: {
    method: string;
    params?: any[] | Record<string, any>;
  }) => Promise<any>;
  on?: (event: string, listener: (...args: any[]) => void) => void;
  removeListener?: (event: string, listener: (...args: any[]) => void) => void;
}

export type EvmNativeCurrency = {
  name: string;
  symbol: string;
  decimals: number;
};

export type EvmChain = {
  chainId: number;
  name: string;
  rpcUrls: string[];
  nativeCurrency: EvmNativeCurrency;
  blockExplorerUrls: string[];
};
