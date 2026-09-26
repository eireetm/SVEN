// BP19-105 Sacred Tiger (Evolved) — 4/4.
// Each Holy Tiger on your field has Ward.
// On Evolve - Summon a Holy Tiger token.
// Activate Bury an amulet: Give this Storm.
import { defineCard, onEvolve } from "../helpers";
import { HOLY_TIGER } from "./shared";
import { holyTigersHaveWard, tigerStorm } from "./shared-haven";

export default defineCard({
  field: holyTigersHaveWard,
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.summon([HOLY_TIGER]);
      },
    }),
    tigerStorm,
  ],
});
