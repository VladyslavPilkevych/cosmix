import { HttpError, ParseError } from "./errors";

export async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, init);

  if (!res.ok) {
    let msg = res.statusText;
    try {
      const text = await res.text();
      if (text) msg = `${msg} — ${text.slice(0, 200)}`;
    } catch(error) {
      console.error(error);
    }
    throw new HttpError(res.status, msg);
  }

  try {
    return (await res.json()) as T;
  } catch {
    throw new ParseError();
  }
}
