import type { CardId } from "../../model/ids";
import type { G } from "../runtime/context";

/** CR 15.1.3 — put counters on a card. */
export function addCounters(g: G, card: CardId, counter: string, amount: number): void {
  const c = g.state.cards[card];
  if (!c || amount <= 0) return; // CR 1.3.2
  c.counters[counter] = (c.counters[counter] ?? 0) + amount;
  g.emit({ type: "countersChanged", card, counter, count: c.counters[counter]! });
}

/** CR 15.1.4 — remove counters (as many as there are). Returns how many were removed. */
export function removeCounters(g: G, card: CardId, counter: string, amount: number): number {
  const c = g.state.cards[card];
  const have = c?.counters[counter] ?? 0;
  const n = Math.min(have, Math.max(0, amount));
  if (!c || n === 0) return 0;
  c.counters[counter] = have - n;
  g.emit({ type: "countersChanged", card, counter, count: have - n });
  return n;
}
