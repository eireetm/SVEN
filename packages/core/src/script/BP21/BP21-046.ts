// BP21-046 Gruinne, Leonardian Provost (Evolved) — 2/2.
// On Evolve - Add 1 to a Stack on your field. (CR 13.3.2.4, ruling.)
// Activate {[engage]} this, Earth Rite (2): Deal 1 damage to each enemy follower on the field.
import { defineCard, onEvolve } from "../helpers";
import { gruinneRite } from "./shared-rune";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.addToStack(1);
      },
    }),
    gruinneRite,
  ],
});
