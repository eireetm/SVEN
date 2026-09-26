// BP13-078 Liberté, Unchained Wolf — Abysscraft follower, 2, 2/2. 獣・キラー.
// {[evolve]} {[cost02]}: Evolve this follower.
// {[fanfare]} Bury another follower: This card's Evolve costs 1 less this turn. (A follower on your field,
// CR 10.4.3.)
import { buryAnotherFromYourField } from "../costs";
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { isFollower } from "../targets";

export default defineCard({
  abilities: [
    evolveAbility(2),
    fanfare({
      cost: buryAnotherFromYourField(isFollower),
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field") yield* fx.changeEvolveCost(fx.self, -1, "endOfTurn");
      },
    }),
  ],
});
