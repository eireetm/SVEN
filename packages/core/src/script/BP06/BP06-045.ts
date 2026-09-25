// BP06-045 Demoncaller (Evolved) — Runecraft follower, 4/4. 陰陽師.
// On Evolve - Summon a Paper Shikigami token.
// Whenever a Shikigami follower is put onto your field, give it {[attack]}+1 and Rush.
import { defineCard, onEvolve } from "../helpers";
import { demoncallerBoost } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.summon(["Paper Shikigami"]);
      },
    }),
    demoncallerBoost,
  ],
});
