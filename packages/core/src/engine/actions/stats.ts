import type { CardId } from "../../model/ids";
import type { G } from "../runtime/context";
import { thisTurn } from "../state/turn-counts";

/**
 * A card gained attack and/or defense — an effect gave it +X (CR 5.27), or a super-evolution its
 * +1/+1 (12.2.4.1). Recorded for "if this follower has gained attack or defense this turn"
 * (BP11-035) and announced for "whenever this follower gains attack or defense" (BP11-082).
 */
export function recordStatsGained(g: G, card: CardId, attack: number, defense: number): void {
  const c = g.state.cards[card];
  if (!c || (attack <= 0 && defense <= 0)) return;
  thisTurn(g.state, c.controller).statsGained.push(card);
  if (defense > 0) thisTurn(g.state, c.controller).defenseGained.push(card); // BP21-096
  g.emit({ type: "statsGained", card, attack: Math.max(0, attack), defense: Math.max(0, defense) });
}
