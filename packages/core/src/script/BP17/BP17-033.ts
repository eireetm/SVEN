// BP17-033 Stone Merchant — Swordcraft follower, 2, 2/2. 商人.
// {[fanfare]} Discard a {[swordcraft]} card: Draw a card. If you discarded a spell, draw 2 instead. (CR 10.4.7.4.)
import type { CustomCost } from "../types";
import { defineCard, fanfare } from "../helpers";
import { isClass, isSpell } from "../targets";

const discardSwordcraft: CustomCost = {
  canPay: (g, c, self) => g.cards(c, "hand").some((id) => id !== self && isClass("Swordcraft")(g, id)),
  *pay(fx) {
    const cards = fx.game.cards(fx.controller, "hand").filter((id) => id !== fx.self && isClass("Swordcraft")(fx.game, id));
    const [card] = yield* fx.chooseCards(cards, 1, 1);
    if (card === undefined) return;
    fx.memory.discardedSpell = isSpell(fx.game, card);
    yield* fx.discardCards([card]);
  },
};

export default defineCard({
  abilities: [
    fanfare({
      cost: discardSwordcraft,
      *resolve(fx) {
        yield* fx.draw(fx.memory.discardedSpell === true ? 2 : 1);
      },
    }),
  ],
});
