// BP09-015 Lila, Arborist — Forestcraft follower, 1, 2/2. 植物族.
// {[fanfare]} Discard a card: Give your leader {[defense]}+1. If you discarded a {[forestcraft]}
// spell, draw a card.
import { defineCard, fanfare } from "../helpers";
import { forestSpell } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      cost: {
        canPay: (g, c) => g.cards(c, "hand").length > 0,
        *pay(fx) {
          const [discarded] = yield* fx.discardCards(yield* fx.chooseCards(fx.game.cards(fx.controller, "hand"), 1, 1));
          fx.memory.discarded = discarded ?? null;
        },
      },
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 1);
        const card = fx.memory.discarded;
        if (typeof card === "string" && fx.game.card(card) && forestSpell(fx.game, card)) yield* fx.draw(1);
      },
    }),
  ],
});
