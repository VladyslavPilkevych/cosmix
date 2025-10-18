import {
  createPublicClient,
  http,
  formatEther,
  type PublicClient,
} from "viem";
import { sepolia, mainnet, type Chain } from "viem/chains";

export const publicClients: Record<number, PublicClient> = {
  [sepolia.id]: createPublicClient({ chain: sepolia, transport: http() }),
  [mainnet.id]: createPublicClient({ chain: mainnet, transport: http() }),
};

function getPublicClient(chainId: number = sepolia.id): PublicClient {
  return publicClients[chainId] ?? publicClients[sepolia.id];
}

export async function getEthBalance(
  address: `0x${string}`,
  chainId: Chain["id"] = sepolia.id
) {
  const client = getPublicClient(chainId);
  const wei = await client.getBalance({ address });
  return { wei, ether: formatEther(wei) };
}
