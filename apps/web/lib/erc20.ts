"use client";
import { createPublicClient, erc20Abi, formatUnits, http } from "viem";
import { mainnet, sepolia } from "wagmi/chains";

export type Token = {
  address: `0x${string}`;
  symbol: string;
  decimals: number;
  coingeckoId?: string;
};

export const client = createPublicClient({
  chain: mainnet,
  transport: http(),
});

export async function getErc20Balances(
  user: `0x${string}`,
  chainId: number,
  tokens: Token[],
) {
  const chain = chainId === sepolia.id ? sepolia : mainnet;
  const client = createPublicClient({ chain, transport: http() });

  const balances = await Promise.all(
    tokens.map(async (token) => {
      try {
        const result = await client.readContract({
          address: token.address,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [user],
        });
        const amount = parseFloat(
          formatUnits(result as bigint, token.decimals),
        );
        return { ...token, amount };
      } catch {
        return { ...token, amount: 0 };
      }
    }),
  );
  return balances;
}

export async function detectNonZeroBalances(
  user: `0x${string}`,
  chainId: number,
  tokens: Token[],
) {
  const chain = chainId === sepolia.id ? sepolia : mainnet;
  const client = createPublicClient({ chain, transport: http() });

  const res = await client.multicall({
    contracts: tokens.map((t) => ({
      address: t.address,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [user],
    })),
    allowFailure: true,
  });

  return tokens
    .map((t, i) => ({
      ...t,
      raw: res[i].status === "success" ? (res[i].result as bigint) : 0n,
    }))
    .filter((x) => x.raw > 0n) // todo: commit for testing
    .map((x) => ({ ...x, amount: Number(x.raw) / 10 ** x.decimals }));
}
