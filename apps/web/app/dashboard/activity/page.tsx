import React from "react";
import Activity from "@/features/activity/Activity";
import { useAccount, useChainId } from "wagmi";
import { COSMOS_NETWORKS } from "@cosmix/sdk";

export const metadata = { title: "Activity — Cosmix" };

export default function ActivityPage({
  searchParams,
}: {
  searchParams?: { chain?: string; type?: string; q?: string };
}) {
  const { address } = useAccount();
  const chainId = useChainId();

  const cosmosNet = COSMOS_NETWORKS.cosmoshub;

  const [cosmosAddress, setCosmosAddress] = React.useState<
    string | undefined
  >();

  React.useEffect(() => {
    (async () => {
      try {
        await (window as any).keplr?.enable(cosmosNet.chainId);
        const signer = await (window as any).keplr?.getOfflineSignerAuto(
          cosmosNet.chainId,
        );
        const accs = await signer.getAccounts();
        setCosmosAddress(accs[0]?.address);
      } catch {}
    })();
  }, []);

  //   todo: remove condition after fix
  if (address || !address) {
    return;
  }

  if (!address && !cosmosAddress) {
    return <div className="p-4">{"Connect your wallet to see activity."}</div>;
  }

  return (
    <>
      <h1 className="text-2xl mb-4">{"Activity"}</h1>
      <div className="p-4">
        <Activity
          evm={
            address
              ? { address, chainId: (chainId ?? 1) as 1 | 11155111 }
              : undefined
          }
          cosmos={
            cosmosAddress
              ? {
                  address: cosmosAddress,
                  lcdBaseUrl: cosmosNet.lcd,
                  explorerTxBaseUrl: cosmosNet.explorerTxBase,
                  //   lcdBaseUrl: "https://rest.cosmos.directory/cosmoshub",
                  //   explorerTxBaseUrl: "https://www.mintscan.io/cosmos/tx/",
                }
              : undefined
          }
          className="max-w-2xl"
        />
      </div>
    </>
  );
}
