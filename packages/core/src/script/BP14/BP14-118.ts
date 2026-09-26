// BP14-118 Torchbearing Guide — Neutral follower, 2, 2/3. 宴楽・傭兵.
// {[fanfare]} Put a Festive card from your hand into your EX area: Draw a card. If there are at least 3 Festive
// cards in your EX area, give this {[attack]}+1/{[defense]}+1. (The card put there counts — ruling.)
import type { CustomCost } from "../types";
import { defineCard, fanfare } from "../helpers";
import { countIn, festive, hasRoom } from "./shared";

const festiveFromHandToEx: CustomCost = {
  canPay: (g, c) => hasRoom(g, c, "ex") && g.cards(c, "hand").some((id) => festive(g, id)),
  *pay(fx) {
    const cards = fx.game.cards(fx.controller, "hand").filter((id) => festive(fx.game, id));
    yield* fx.putIntoEx(yield* fx.chooseCards(cards, 1, 1));
  },
};

export default defineCard({
  abilities: [
    fanfare({
      cost: festiveFromHandToEx,
      *resolve(fx) {
        yield* fx.draw(1);
        if (countIn(fx.game, fx.controller, "ex", festive) >= 3 && fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 1, 1);
      },
    }),
  ],
});
