// CP04-116 Kasumi — Neutral follower, 2, 1/3. プリコネ・カォン.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Put a PriConne card from your hand into your EX area: Look at the top 2 cards of your deck. Put any number of them on
// the top of your deck in any order. Put the rest on the bottom in any order. (The card must fit into the EX area, CR 10.6.2.5.)
// (The scraped official English text belongs to another card.)
import type { CardId, PlayerId } from "../../model/ids";
import type { GameReader } from "../../engine/query";
import type { CustomCost } from "../types";
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { arrangeTop, priconne } from "./shared";

const fromHand = (g: GameReader, c: PlayerId): CardId[] =>
  g.cards(c, "ex").length < g.exAreaLimit(c) ? g.cards(c, "hand").filter((id) => priconne(g, id)) : [];

const priconneToEx: CustomCost = {
  canPay: (g, c) => fromHand(g, c).length > 0,
  *pay(fx) {
    yield* fx.putIntoEx(yield* fx.chooseCards(fromHand(fx.game, fx.controller), 1, 1));
  },
};

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      cost: priconneToEx,
      *resolve(fx) {
        yield* arrangeTop(fx, 2);
      },
    }),
  ],
});
