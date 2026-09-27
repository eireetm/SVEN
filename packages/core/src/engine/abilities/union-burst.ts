import type { DefId } from "../../model/card";
import type { CardId, PlayerId } from "../../model/ids";
import type { G } from "../runtime/context";
import type { Env } from "../state/access";
import { thisTurn } from "../state/turn-counts";

/**
 * CR 14.5.1.2 — the Union Burst abilities of a card are invalid at all times and in all zones unless the deck it belongs to
 * (its owner's; a token's is its creator's, 9.1.2.1) is based on Princess Connect! Re: Dive.
 */
export function unionBurstValid(env: Env, card: CardId): boolean {
  const c = env.state.cards[card];
  return c !== undefined && env.state.players[c.owner].universe === "princessConnect";
}

/**
 * CR 14.5.1.3 — a Union Burst ability has "executed" once it is played (10.6.2.7) and resolved (10.6.2.8). The engine resolves
 * every ability it plays, so the execution is recorded when it is played: an ability executed by another one's effect sees the
 * outer one as executed (CP04-114 ruling Q14: Ameth's own Union Burst counts for Eris's condition, which is checked inside it).
 */
export function recordUnionBurst(g: G, player: PlayerId, source: CardId, sourceDef: DefId, ability: number): void {
  thisTurn(g.state, player).unionBursts += 1;
  g.emit({ type: "unionBurstExecuted", player, source, sourceDef, ability });
}
