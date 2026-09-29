// What two connected programs say to each other (docs/online.md). Plain JSON; anything else that arrives is ignored (the
// other side may run another version, or not be this program at all).

/** Who a program is: its version and a fingerprint of its card data (two programs must play the same cards, later the same engine). */
export interface Hello {
  t: "hello";
  version: string;
  cards: string;
}

export type NetMessage =
  | Hello
  /** The host chose this connection among the relays' (the others close). */
  | { t: "select" }
  /** The host has a guest already. */
  | { t: "full" }
  | { t: "chat"; text: string }
  | { t: "ping"; n: number }
  | { t: "pong"; n: number }
  /** Leaving on purpose (not a lost connection). */
  | { t: "bye" };

/** The longest chat line. */
export const CHAT_MAX = 500;

/** A message received, if it is one (checked field by field). */
export function parseMessage(value: unknown): NetMessage | null {
  if (typeof value !== "object" || value === null) return null;
  const m = value as Record<string, unknown>;
  switch (m.t) {
    case "hello":
      return typeof m.version === "string" && typeof m.cards === "string" ? { t: "hello", version: m.version.slice(0, 64), cards: m.cards.slice(0, 64) } : null;
    case "select":
    case "full":
    case "bye":
      return { t: m.t };
    case "chat":
      return typeof m.text === "string" ? { t: "chat", text: m.text.slice(0, CHAT_MAX) } : null;
    case "ping":
    case "pong":
      return typeof m.n === "number" && Number.isFinite(m.n) ? { t: m.t, n: m.n } : null;
    default:
      return null;
  }
}
