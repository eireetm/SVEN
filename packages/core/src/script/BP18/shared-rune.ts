// Shared pieces of BP18 Runecraft card scripts (not a card: the file name has no set prefix).
import type { EffectContext } from "../../engine/effects/context";
import type { Proc } from "../../engine/runtime/proc";

/** "Banish N cards from your hand" (BP18-039, 041, 043): the player picks them (as many as the hand has). */
export function* banishFromHand(fx: EffectContext, n: number): Proc<void> {
  const hand = fx.game.cards(fx.controller, "hand");
  if (hand.length === 0) return;
  yield* fx.banish(yield* fx.chooseCards(hand, Math.min(n, hand.length), Math.min(n, hand.length)));
}

/** "Banish the top N cards of your deck" (BP18-045, 046, 047, 050, 051). */
export function* banishTop(fx: EffectContext, n: number): Proc<void> {
  const top = fx.topCards(n);
  if (top.length > 0) yield* fx.banish(top);
}
