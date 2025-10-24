import { createPublicClient, http, formatEther, type PublicClient } from "viem";
import { sepolia, mainnet, type Chain } from "viem/chains";

type SupportedChainId = typeof mainnet.id | typeof sepolia.id; // 1 | 11155111

export const publicClients: Record<SupportedChainId, PublicClient> = {
  [sepolia.id]: createPublicClient({ chain: sepolia, transport: http() }),
  [mainnet.id]: createPublicClient({ chain: mainnet, transport: http() }),
};

function isSupportedChainId(id: number): id is SupportedChainId {
  return id === mainnet.id || id === sepolia.id;
}

function getPublicClient(chainId?: number): PublicClient {
  const fallback: SupportedChainId = sepolia.id;
  const cid: SupportedChainId =
    chainId && isSupportedChainId(chainId) ? chainId : fallback;
  return publicClients[cid];
}

export async function getEthBalance(address: `0x${string}`, chainId?: number) {
  const client = getPublicClient(chainId);
  const wei = await client.getBalance({ address });
  return { wei, ether: formatEther(wei) };
}
