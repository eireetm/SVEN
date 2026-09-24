// BP04-041 Star Reader Stella — Runecraft follower, 3, 3/3. 魔法使い・星神.
// {[fanfare]} Look at the top 4 cards of your deck. Add one of them to your hand, put one into your
// cemetery, put one on top of your deck, and put one on the bottom of your deck.
// With fewer cards, the later ones are skipped; only the card put into the cemetery is seen by
// the opponent (rulings).
// Strike: Look at the top card of your deck. You may put it into your cemetery.
import type { CardId } from "../../model/ids";
import type { EffectContext } from "../../engine/effects/context";
import { defineCard, fanfare, strike } from "../helpers";

function* pickOne(fx: EffectContext, cards: readonly CardId[], seen: readonly CardId[]) {
  if (cards.length === 0) return undefined;
  const [card] = yield* fx.selectCards(cards, 1, 1, fx.controller, seen);
  return card;
}

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const top = fx.topCards(4);
        if (top.length === 0) return;
        yield* fx.lookAt(top);
        const toHand = yield* pickOne(fx, top, top);
        const afterHand = top.filter((id) => id !== toHand);
        const toCemetery = yield* pickOne(fx, afterHand, top);
        const afterCemetery = afterHand.filter((id) => id !== toCemetery);
        const toTop = yield* pickOne(fx, afterCemetery, top);
        const toBottom = afterCemetery.find((id) => id !== toTop);
        if (toHand) yield* fx.returnToHand([toHand]);
        if (toCemetery) yield* fx.bury([toCemetery]);
        if (toBottom) yield* fx.putOnDeck([toBottom], "bottom");
        if (toTop) yield* fx.putOnDeck([toTop], "top");
      },
    }),
    strike({
      *resolve(fx) {
        const [top] = fx.topCards(1);
        if (top === undefined) return;
        yield* fx.lookAt([top]);
        if (yield* fx.confirm(fx.controller, top)) yield* fx.bury([top]);
      },
    }),
  ],
});
