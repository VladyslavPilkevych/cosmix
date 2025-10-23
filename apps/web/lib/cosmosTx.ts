export type CosmosTx = {
  hash: string;
  height: number;
  timestamp: number;
  from?: string;
  to?: string;
  amount?: string;
  denom?: string;
  typeUrl?: string;
  explorerUrl: string;
};

export type CosmosPage = {
  items: CosmosTx[];
  nextKey?: string | null;
  hasMore: boolean;
};

export type CosmosAccount = {
  address: string;
  lcdBaseUrl: string;
  explorerTxBaseUrl?: string;
};

function parseAmountFromMsg(msg: any) {
  const any = msg?.value ?? {};
  const amountArr =
    any?.amount || any?.token || any?.tokens || any?.outputs || [];

  if (Array.isArray(amountArr) && amountArr.length > 0) {
    const first = amountArr[0];
    if (typeof first?.amount === "string" && typeof first?.denom === "string") {
      return { amount: first.amount, denom: first.denom };
    }
  }
  if (typeof any?.amount === "string" && typeof any?.denom === "string") {
    return { amount: any.amount, denom: any.denom };
  }
  return undefined;
}

// export async function getCosmosTxPage(params: {
//   account: CosmosAccount;
//   nextKey?: string | null;
//   nextKeyRecipient?: string | null;
//   limit?: number;
// }): Promise<{ page: CosmosPage; nextKeySender?: string | null; nextKeyRecipient?: string | null }> {
//   const { account, nextKey, nextKeyRecipient, limit = 30 } = params;

//   const senderURL = new URL(`${account.lcdBaseUrl}/cosmos/tx/v1beta1/txs`);
//   senderURL.searchParams.set("order_by", "ORDER_BY_DESC");
//   senderURL.searchParams.set("limit", String(limit));
//   senderURL.searchParams.set(
//     "events",
//     `message.sender='${account.address}'`
//   );
//   if (nextKey) senderURL.searchParams.set("pagination.key", nextKey);

//   const recipientURL = new URL(`${account.lcdBaseUrl}/cosmos/tx/v1beta1/txs`);
//   recipientURL.searchParams.set("order_by", "ORDER_BY_DESC");
//   recipientURL.searchParams.set("limit", String(limit));
//   recipientURL.searchParams.set(
//     "events",
//     `transfer.recipient='${account.address}'`
//   );
//   if (nextKeyRecipient) recipientURL.searchParams.set("pagination.key", nextKeyRecipient);

//   const [rs, rr] = await Promise.all([fetch(senderURL), fetch(recipientURL)]);
//   if (!rs.ok) throw new Error(`LCD sender HTTP ${rs.status}`);
//   if (!rr.ok) throw new Error(`LCD recipient HTTP ${rr.status}`);

//   const sData = await rs.json();
//   const rData = await rr.json();

//   const normalize = (txs: any[]) =>
//     (txs ?? []).map((t) => {
//       const hash = t?.tx_response?.txhash ?? t?.txhash;
//       const height = Number(t?.tx_response?.height ?? t?.height ?? 0);
//       const tsStr = t?.tx_response?.timestamp ?? t?.timestamp;
//       const timestamp = tsStr ? Math.floor(new Date(tsStr).getTime() / 1000) : 0;

//       const msgs: any[] = t?.tx?.body?.messages ?? [];
//       const firstMsg = msgs[0];
//       const amt = parseAmountFromMsg(firstMsg);

//       let from: string | undefined;
//       let to: string | undefined;
//       if (firstMsg?.["@type"] === "/cosmos.bank.v1beta1.MsgSend" || firstMsg?.type_url === "/cosmos.bank.v1beta1.MsgSend") {
//         const v = firstMsg?.value ?? firstMsg;
//         from = v?.from_address;
//         to = v?.to_address;
//       }

//       return {
//         hash,
//         height,
//         timestamp,
//         from,
//         to,
//         amount: amt?.amount,
//         denom: amt?.denom,
//         typeUrl: firstMsg?.["@type"] ?? firstMsg?.type_url,
//         explorerUrl: account.explorerTxBaseUrl ? `${account.explorerTxBaseUrl}${hash}` : "#",
//       } as CosmosTx;
//     });

//   const items = [...normalize(sData?.txs ?? sData?.tx_responses), ...normalize(rData?.txs ?? rData?.tx_responses)];
//   const uniq = new Map<string, CosmosTx>();
//   for (const it of items) uniq.set(it.hash, it);
//   const merged = Array.from(uniq.values()).sort((a, b) => (b.timestamp - a.timestamp) || (b.height - a.height));

//   const nextKeySender = sData?.pagination?.next_key ?? null;
//   const nextKeyRecip = rData?.pagination?.next_key ?? null;

//   return {
//     page: {
//       items: merged,
//       nextKey: nextKeySender || nextKeyRecip,
//       hasMore: Boolean(nextKeySender || nextKeyRecip),
//     },
//     nextKeySender,
//     nextKeyRecipient: nextKeyRecip,
//   };
// }

export async function getCosmosTxPage(params: {
  account: CosmosAccount;
  nextKey?: string | null;
  nextKeyRecipient?: string | null;
  limit?: number;
}): Promise<{
  page: CosmosPage;
  nextKeySender?: string | null;
  nextKeyRecipient?: string | null;
}> {
  const { account, nextKey, nextKeyRecipient, limit = 20 } = params;
  const base = "/api/cosmos/txs";

  const senderURL = new URL(
    base,
    typeof window !== "undefined" ? window.location.origin : "http://localhost",
  );
  senderURL.searchParams.set("order_by", "ORDER_BY_DESC");
  senderURL.searchParams.set("limit", String(limit));
  senderURL.searchParams.set("events", `message.sender='${account.address}'`);
  if (nextKey) senderURL.searchParams.set("pagination.key", nextKey);

  const recipientURL = new URL(
    base,
    typeof window !== "undefined" ? window.location.origin : "http://localhost",
  );
  recipientURL.searchParams.set("order_by", "ORDER_BY_DESC");
  recipientURL.searchParams.set("limit", String(limit));
  recipientURL.searchParams.set(
    "events",
    `transfer.recipient='${account.address}'`,
  );
  if (nextKeyRecipient)
    recipientURL.searchParams.set("pagination.key", nextKeyRecipient);

  async function fetchJSON(url: URL, tries = 2) {
    for (let i = 0; i < tries; i++) {
      const r = await fetch(url.toString(), {
        headers: { accept: "application/json" },
        cache: "no-store",
      });
      if (r.ok) return r.json();
      if (r.status >= 500 && i + 1 < tries) {
        await new Promise((res) => setTimeout(res, 300 * (i + 1)));
        continue;
      }
      throw new Error(`Cosmos proxy HTTP ${r.status}`);
    }
  }

  const [sData, rData] = await Promise.all([
    fetchJSON(senderURL),
    fetchJSON(recipientURL),
  ]);

  const normalize = (txs: any[]) =>
    (txs ?? []).map((t) => {
      const hash = t?.tx_response?.txhash ?? t?.txhash;
      const height = Number(t?.tx_response?.height ?? t?.height ?? 0);
      const tsStr = t?.tx_response?.timestamp ?? t?.timestamp; // RFC3339
      const timestamp = tsStr
        ? Math.floor(new Date(tsStr).getTime() / 1000)
        : 0;

      const msgs: any[] = t?.tx?.body?.messages ?? [];
      const firstMsg = msgs[0];
      const amt = parseAmountFromMsg(firstMsg);

      let from: string | undefined;
      let to: string | undefined;
      if (
        firstMsg?.["@type"] === "/cosmos.bank.v1beta1.MsgSend" ||
        firstMsg?.type_url === "/cosmos.bank.v1beta1.MsgSend"
      ) {
        const v = firstMsg?.value ?? firstMsg;
        from = v?.from_address;
        to = v?.to_address;
      }

      return {
        hash,
        height,
        timestamp,
        from,
        to,
        amount: amt?.amount,
        denom: amt?.denom,
        typeUrl: firstMsg?.["@type"] ?? firstMsg?.type_url,
        explorerUrl: account.explorerTxBaseUrl
          ? `${account.explorerTxBaseUrl}${hash}`
          : "#",
      } as CosmosTx;
    });

  const sItems = sData?.txs ?? sData?.tx_responses;
  const rItems = rData?.txs ?? rData?.tx_responses;

  const items = [...normalize(sItems), ...normalize(rItems)];
  const uniq = new Map<string, CosmosTx>();
  for (const it of items) uniq.set(it.hash, it);

  const merged = Array.from(uniq.values()).sort(
    (a, b) => b.timestamp - a.timestamp || b.height - a.height,
  );

  const nextKeySender = sData?.pagination?.next_key ?? null;
  const nextKeyRecip = rData?.pagination?.next_key ?? null;

  return {
    page: {
      items: merged,
      nextKey: nextKeySender || nextKeyRecip,
      hasMore: Boolean(nextKeySender || nextKeyRecip),
    },
    nextKeySender,
    nextKeyRecipient: nextKeyRecip,
  };
}
