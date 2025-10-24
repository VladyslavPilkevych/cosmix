import { mainnet, sepolia } from "wagmi/chains";
import { EvmChain } from "../evm/types";


export const SUPPORTED_EVM: EvmChain[] = [
  {
    chainId: mainnet.id,
    name: mainnet.name,
    rpcUrls: [mainnet.rpcUrls.default.http.toString()],
    nativeCurrency: mainnet.nativeCurrency,
    blockExplorerUrls: [mainnet.blockExplorers?.default?.url ?? "https://etherscan.io"],
  },
  {
    chainId: sepolia.id,
    name: sepolia.name,
    rpcUrls: [sepolia.rpcUrls.default.http.toString()],
    nativeCurrency: sepolia.nativeCurrency,
    blockExplorerUrls: [sepolia.blockExplorers?.default?.url ?? "https://sepolia.etherscan.io"],
  },
];
