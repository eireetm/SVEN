// BP16-046 Penelope, Potions Prodigy — Runecraft follower, 2, 2/2. 錬金術師.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Summon a Magic Sediment token.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { MAGIC_SEDIMENT } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.summon([MAGIC_SEDIMENT]);
      },
    }),
  ],
});
