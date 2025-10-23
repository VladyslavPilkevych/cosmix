"use client";

import { Box, Heading } from "@chakra-ui/react";
import { Balances } from "../components/Balances";
import Activity from "../components/Activity";
import { useAccount, useChainId } from "wagmi";
import React from "react";
import { COSMOS_NETWORKS } from "../config/cosmos";

export default function Home() {
  // const { address } = useAccount();
  // const chainId = useChainId();

  // const cosmosNet = COSMOS_NETWORKS.cosmoshub;

  // const [cosmosAddress, setCosmosAddress] = React.useState<
  //   string | undefined
  // >();

  // React.useEffect(() => {
  //   (async () => {
  //     try {
  //       await (window as any).keplr?.enable(cosmosNet.chainId);
  //       const signer = await (window as any).keplr?.getOfflineSignerAuto(
  //         cosmosNet.chainId,
  //       );
  //       const accs = await signer.getAccounts();
  //       setCosmosAddress(accs[0]?.address);
  //     } catch {}
  //   })();
  // }, []);
  return (
    <Box p={6}>
      <Heading size="md" mb={4}>
        {"Overview"}
      </Heading>
      <Balances />
      {/* <div className="p-4">
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
                  // lcdBaseUrl: cosmosNet.lcd,
                  // explorerTxBaseUrl: cosmosNet.explorerTxBase,
                  lcdBaseUrl: "https://rest.cosmos.directory/cosmoshub",
                  explorerTxBaseUrl: "https://www.mintscan.io/cosmos/tx/",
                }
              : undefined
          }
          className="max-w-2xl"
        />
      </div> */}
    </Box>
  );
}
