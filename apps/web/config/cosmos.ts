export const COSMOS_NETWORKS = {
  cosmoshub: {
    chainId: "cosmoshub-4",
    lcd: "https://lcd-cosmoshub.keplr.app",
    explorerTxBase: "https://www.mintscan.io/cosmos/tx/",
    bech32Prefix: "cosmos",
  },
  osmosis: {
    chainId: "osmosis-1",
    lcd: "https://lcd-osmosis.keplr.app",
    explorerTxBase: "https://www.mintscan.io/osmosis/tx/",
    bech32Prefix: "osmo",
  },
} as const;
