import type { CardId, PlayerId } from "../../model/ids";
import type { G } from "../runtime/context";
import { nextSeq, type Env } from "../state/access";
import { isRacing, linkedCards } from "../state/links";
import { moveCards } from "../state/zones";

export { isRacing };

/**
 * CR 14.2 (Umamusume: Pretty Derby) — serving and racing. Carrot cards are built into the evolve deck (CP01-085,
 * up to 10: CR 6.1.2); serving puts them into the race zone (4.13) linked to the served card; a card racing while
 * linked has Rush. Rules handling 11.8 returns unlinked Carrots faceup to the evolve deck area.
 */

/** The card name of Carrot cards (CR 14.2.1.1). */
export const CARROT = "Carrot";

/** Facedown Carrot cards in the player's evolve deck: faceup cards in the evolve deck area are used (CR 4.6.3). */
export function carrotsToServe(env: Env, p: PlayerId): CardId[] {
  return env.state.players[p].zones.evolveDeck.filter((id) => {
    const c = env.state.cards[id]!;
    return !c.faceUp && env.db.get(c.def).name === CARROT;
  });
}

/**
 * CR 14.2.1 — can this card be served `times` times as a cost? It must be on the field and not linked to a race-zone
 * card (14.2.1.2.1: then serving does nothing and can't be a cost; a follower that raced can't serve again — CP01-042
 * ruling), with enough facedown Carrots (CP01-042 ruling).
 */
export function canServe(env: Env, id: CardId, times: number): boolean {
  const c = env.state.cards[id];
  return c !== undefined && c.zone === "field" && linkedCards(env, id, "raceZone").length === 0 && carrotsToServe(env, c.controller).length >= times;
}

/**
 * CR 14.2.1.1 — serve a card `times` times: its controller puts that many Carrot cards from their evolve deck into
 * their race zone, linked to it. Nothing happens when it is already linked (14.2.1.2). Returns whether it was served.
 */
export function serve(g: G, id: CardId, times: number): boolean {
  if (!canServe(g, id, times)) return false;
  const p = g.state.cards[id]!.controller;
  const carrots = carrotsToServe(g, p).slice(0, times);
  moveCards(g, carrots.map((card) => ({ card, to: "raceZone" as const, player: p, linkTo: id })), "effect");
  return true;
}

/**
 * CR 14.2.3.1 — race a card `times` times: as long as it is linked to a race-zone card it has Rush and has raced
 * that many times. Each race is an On Race trigger (14.2.4; racing twice triggers it twice — CP01-042 ruling).
 */
export function race(g: G, id: CardId, times: number): void {
  const c = g.state.cards[id];
  if (!c || c.zone !== "field" || times <= 0 || linkedCards(g, id, "raceZone").length === 0) return;
  c.raced = (c.raced ?? 0) + times;
  c.raceSeq ??= nextSeq(g.state);
  g.emit({ type: "raced", card: id, player: c.controller, times });
}
