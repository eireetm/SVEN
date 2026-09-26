// BP14-006 Spirit of the Spring — Forestcraft follower, 2, 2/3. 精霊.
// At the start of your end phase, discard a card: Put the top card of your deck into your EX area.
// Activate Return a card in your EX area to its owner's hand: Put a card from your hand into your EX area.
// Activate only once per turn. (With an empty hand the cost can be paid, and the returned card goes back
// into the EX area — rulings.)
import type { CustomCost } from "../types";
import { discardCardsCost } from "../costs";
import { activated, atStartOfYourEndPhase, defineCard } from "../helpers";

const returnExCard: CustomCost = {
  canPay: (g, c) => g.cards(c, "ex").length > 0,
  *pay(fx) {
    yield* fx.returnToHand(yield* fx.chooseCards(fx.game.cards(fx.controller, "ex"), 1, 1));
  },
};

export default defineCard({
  abilities: [
    atStartOfYourEndPhase({
      cost: discardCardsCost(1),
      *resolve(fx) {
        yield* fx.topToEx(1);
      },
    }),
    activated(
      { custom: returnExCard },
      {
        oncePerTurn: true,
        *resolve(fx) {
          const hand = fx.game.cards(fx.controller, "hand");
          yield* fx.putIntoEx(yield* fx.chooseCards(hand, Math.min(1, hand.length), 1));
        },
      },
    ),
  ],
});
