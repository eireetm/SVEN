// BP08-048 Rabbit Mage — Runecraft follower, 2, 2/1. 魔法使い・獣.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Summon a Magic Sediment token.
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.summon(["Magic Sediment"]);
      },
    }),
  ],
});
