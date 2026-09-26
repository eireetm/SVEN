// BP19-104 Sacred Tiger — Havencraft follower, 6, 3/3. 光輝・獣.
// {[evolve]} {[cost01]}: Evolve this.
// Each Holy Tiger on your field has Ward.
// {[fanfare]} Summon a Holy Tiger token.
// Activate Bury an amulet: Give this Storm.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { HOLY_TIGER } from "./shared";
import { holyTigersHaveWard, tigerStorm } from "./shared-haven";

export default defineCard({
  field: holyTigersHaveWard,
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        yield* fx.summon([HOLY_TIGER]);
      },
    }),
    tigerStorm,
  ],
});
