// BP03-057 Lævateinn Dragon (Evolved) — Dragoncraft, 6/6.
// Assail.
// On Evolve: Summon a Draconic Weapon. Recover 2 play points.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  keywords: ["assail"],
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.summon(["Draconic Weapon"]);
        yield* fx.recoverPlayPoints(2);
      },
    }),
  ],
});
