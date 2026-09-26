// BP13-015 Edgy Elf — Forestcraft follower, 3, 2/2. エルフ族.
// Storm.
// Strike - Banish the top 3 cards of your deck: Give this follower {[attack]}+1/{[defense]}+1. (The process
// is optional and needs 3 cards, CR 10.4.7.4.)
import type { CustomCost } from "../types";
import { defineCard, strike } from "../helpers";

const banishTop3: CustomCost = {
  canPay: (g, c) => g.cards(c, "deck").length >= 3,
  *pay(fx) {
    yield* fx.banish(fx.topCards(3));
  },
};

export default defineCard({
  keywords: ["storm"],
  abilities: [
    strike({
      cost: banishTop3,
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 1, 1);
      },
    }),
  ],
});
