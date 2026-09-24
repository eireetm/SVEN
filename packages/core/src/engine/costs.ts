import type { CardId, PlayerId } from "../model/ids";
import type { PlayOption } from "../script/types";
import { EngineError } from "./errors";
import type { G } from "./runtime/context";
import { selectCards } from "./runtime/decide";
import type { Proc } from "./runtime/proc";
import { getCard, type Env } from "./state/access";
import { characteristics, infoDefId } from "./state/characteristics";
import { moveCards } from "./state/zones";
import { makeReader } from "./query";

/**
 * CR 10.4.4.1 / 10.6.2.5.1 — the play points needed to play `card` now.
 *  1. printed cost (2.5), or the value set by a play option / effect ("costs N", "for 0");
 *     set-to-value changes are applied first (10.10.2.4);
 *  2. increases / decreases: the card's own passive (e.g. Spellchain reductions), passives of
 *     cards on its player's field (e.g. "your Golem followers cost 1 less"), effects on the
 *     card (e.g. "It costs 2 less to play"), the chosen play option;
 *  3. never below 0 (1.3.2.2.1).
 * The card's cost information itself does not change (10.4.4.1).
 */
export function playCost(g: Env, card: CardId, player: PlayerId, option: PlayOption | null = null, setTo?: number): number {
  const reader = makeReader(g);
  const base = characteristics(g, card).cost ?? 0;
  // Effects that set the cost (e.g. BP02-091 "Those cards cost 0 play points to play"); the
  // latest one applies (timestamp order, 10.9.1.6).
  let setByEffect: number | undefined;
  for (const e of g.state.effects) if (e.target === card && e.change.kind === "playCostSet") setByEffect = e.change.value;
  let cost = setTo ?? option?.setCost ?? setByEffect ?? base;
  cost += g.scripts[getCard(g.state, card).def]?.playCost?.(reader, card, player) ?? 0;
  for (const f of g.state.players[player].zones.field) {
    cost += g.scripts[infoDefId(g, f)]?.field?.playCostOf?.(reader, f, card, player) ?? 0;
  }
  for (const e of g.state.effects) if (e.target === card && e.change.kind === "playCost") cost += e.change.amount;
  cost += option?.costDelta ?? 0;
  // BP03-038 "the next spell you play this turn costs N less", after set-to-value changes
  // (the Transcendence ruling: a cost set to 7 is then reduced by 4).
  if (characteristics(g, card).type === "spell") cost -= g.state.players[player].nextSpellReduction;
  return Math.max(0, cost);
}

/** CR 13.3.3.2 — amulets with Stack on the field that have at least `count` Stack counters. */
export function earthRiteSources(g: Env, player: PlayerId, count = 1): CardId[] {
  return makeReader(g)
    .stackCards(player)
    .filter((id) => (getCard(g.state, id).counters.stack ?? 0) >= count);
}

/**
 * CR 13.3.3.2 — pay Earth Rite: remove `count` Stack counters from one amulet with Stack on
 * the player's field (the player picks which); if its last counter was removed, it is put
 * into its owner's cemetery.
 */
export function* payEarthRite(g: G, player: PlayerId, count: number, source: CardId | null): Proc<void> {
  const sources = earthRiteSources(g, player, count);
  if (sources.length === 0) throw new EngineError("Earth Rite cannot be paid");
  const [amulet] = yield* selectCards(g, player, "cost", sources, 1, 1, source);
  const c = getCard(g.state, amulet!);
  const left = (c.counters.stack ?? 0) - count;
  c.counters.stack = left;
  g.emit({ type: "countersChanged", card: c.id, counter: "stack", count: left });
  if (left <= 0) moveCards(g, [{ card: c.id, to: "cemetery", reason: "effect" }], "effect");
}
