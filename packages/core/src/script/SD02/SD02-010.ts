// SD02-010 Oathless Knight — Swordcraft follower, 2, 1/1. 兵士.
// {[evolve]} {[cost01]}: Evolve this follower.
// {[fanfare]} Summon a Knight token. (Nothing with a full field — ruling.)
import { defineCard, evolveAbility, fanfare } from "../helpers";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.summon(["Knight"]);
      },
    }),
  ],
});
