import { NextRequest } from "next/server";

const ENV_BASE = process.env.COSMOS_LCD_BASE;

const LCD_FALLBACKS = [
  ENV_BASE,
  "https://rest.cosmos.directory/cosmoshub",
  "https://cosmos-rest.publicnode.com",
].filter(Boolean) as string[];

const PATH = "/cosmos/tx/v1beta1/txs";
export const dynamic = "force-dynamic";

async function fetchOnceWithTimeout(url: string, ms = 8000) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort("timeout"), ms);
  try {
    const r = await fetch(url, {
      headers: { accept: "application/json" },
      cache: "no-store",
      signal: c.signal,
    });
    return r;
  } finally {
    clearTimeout(t);
  }
}

export async function GET(req: NextRequest) {
  const u = new URL(req.url);
  const qs = new URLSearchParams(u.searchParams);

  if (!qs.has("limit")) qs.set("limit", "10");
  if (!qs.has("order_by")) qs.set("order_by", "ORDER_BY_DESC");

  let lastErr: unknown;
  const tried: string[] = [];

  for (const base of LCD_FALLBACKS) {
    const target = `${base}${PATH}?${qs.toString()}`;
    tried.push(target);
    try {
      const r = await fetchOnceWithTimeout(target, 8000);
      if (!r.ok) throw new Error(`HTTP_${r.status}`);
      const body = await r.text();
      const ct = r.headers.get("content-type") ?? "application/json";
      return new Response(body, { status: 200, headers: { "content-type": ct } });
    } catch (e) {
      lastErr = e;
    }
  }

  return new Response(
    JSON.stringify({ error: "All Cosmos LCD endpoints failed", detail: String(lastErr ?? ""), tried }),
    { status: 502, headers: { "content-type": "application/json" } }
  );
}
