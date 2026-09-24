// BP03-088 Devilish Flautist — Abysscraft follower, 3, 3/3. 魔界.
// Rush.
// {[fanfare]} Discard a random card: +1 attack and Drain (CR 12.13, given by the effect).
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    fanfare({
      cost: {
        canPay: (g, c) => g.cards(c, "hand").length >= 1,
        *pay(fx) {
          yield* fx.discardRandom(1);
        },
      },
      *resolve(fx) {
        yield* fx.giveStats(fx.self, 1, 0);
        yield* fx.giveKeyword(fx.self, "drain");
      },
    }),
  ],
});
