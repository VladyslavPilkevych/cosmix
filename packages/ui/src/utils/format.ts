export const formatAmount = (n: number, dp=6) =>
  n.toLocaleString(undefined, { maximumFractionDigits: dp });
export const formatFiat = (n: number, code: string) =>
  n.toLocaleString(undefined, { style: "currency", currency: code });
