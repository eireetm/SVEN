// BP17-105 Steelwing (Evolved) — 5/6.
// Storm.
// On Evolve - Summon 2 Assembly Droid tokens.
import { defineCard, onEvolve } from "../helpers";
import { DROID } from "./shared";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.summon([DROID, DROID]);
      },
    }),
  ],
});
