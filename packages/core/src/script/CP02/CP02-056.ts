// CP02-056 Akira Sunazuka — Dragoncraft follower, 2, 2/3. デレマス・クール.
// {[fanfare]} Discard up to 3 cards: If you discarded at least 1 Cute card, give your leader {[defense]}+2. If you discarded at
// least 1 Cool card, draw a card. If you discarded at least 1 Passion card, deal 2 damage to each enemy leader.
// {[fanfare]} If you have 10 max play points, draw 2 cards.
// (Rulings: a card with several types satisfies each; two Cute cards still give +2 once. Discarding none would do nothing, so
// paying the cost discards at least 1 card; CR 10.4.7.4.)
import type { CustomCost } from "../types";
import { defineCard, fanfare } from "../helpers";
import { cool, cute, damageEnemyLeader, maxPlayPointsTen, passion } from "./shared";

const discardUpTo3: CustomCost = {
  canPay: (g, c) => g.cards(c, "hand").length > 0,
  *pay(fx) {
    const g = fx.game;
    const hand = g.cards(fx.controller, "hand");
    const chosen = yield* fx.chooseCards(hand, 1, Math.min(3, hand.length));
    fx.memory.cute = chosen.some((id) => cute(g, id));
    fx.memory.cool = chosen.some((id) => cool(g, id));
    fx.memory.passion = chosen.some((id) => passion(g, id));
    yield* fx.discardCards(chosen);
  },
};

export default defineCard({
  abilities: [
    fanfare({
      cost: discardUpTo3,
      *resolve(fx) {
        if (fx.memory.cute === true) yield* fx.giveLeaderDefense(fx.controller, 2);
        if (fx.memory.cool === true) yield* fx.draw(1);
        if (fx.memory.passion === true) yield* damageEnemyLeader(fx, 2);
      },
    }),
    fanfare({
      condition: (g, c) => maxPlayPointsTen(g, c),
      *resolve(fx) {
        yield* fx.draw(2);
      },
    }),
  ],
});
