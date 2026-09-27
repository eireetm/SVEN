// SD04-009 Roc — Dragoncraft follower, 3, 3/3. 獣.
// {[evolve]} {[cost00]}: Evolve this follower.
// Strike: Give this follower {[attack]}+1. (It lasts after the attack — ruling.)
import { defineCard, evolveAbility, strike } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(0),
    strike({
      *resolve(fx) {
        yield* fx.giveStats(fx.self, 1, 0);
      },
    }),
  ],
});
