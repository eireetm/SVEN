// BP05-062 Amethyst Giant — Dragoncraft follower, 9, 7/7. 巨人・超克.
// {[fanfare]} Discard a card: Give this follower Rush and Aura.
// Strike: Refresh this follower. This ability can be performed once per turn. (CR 10.7.2.2)
import { defineCard, fanfare, strike } from "../helpers";
import { discardCardsCost } from "../costs";

export default defineCard({
  abilities: [
    fanfare({
      cost: discardCardsCost(1),
      *resolve(fx) {
        yield* fx.giveKeyword(fx.self, "rush");
        yield* fx.giveKeyword(fx.self, "aura");
      },
    }),
    strike({
      oncePerTurn: true,
      *resolve(fx) {
        yield* fx.refresh([fx.self]);
      },
    }),
  ],
});
