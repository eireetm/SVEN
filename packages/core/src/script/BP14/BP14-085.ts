// BP14-085 Bat Usher — Abysscraft follower, 1, 2/2. 宴楽・魔界・獣.
// {[fanfare]} If there are 2 cards or less in your hand, give this {[attack]}+1. If there are 0, give it Storm.
// (Both with 0 cards; counted after it was played — rulings.)
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone !== "field") return;
        const hand = fx.game.cards(fx.controller, "hand").length;
        if (hand <= 2) yield* fx.giveStats(fx.self, 1, 0);
        if (hand === 0) yield* fx.giveKeyword(fx.self, "storm");
      },
    }),
  ],
});
