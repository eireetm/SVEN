// BP14-054 Si Long, Draconic God-Queen (Evolved) — Dragoncraft follower, 4/4. 宴楽・ドラゴニュート.
// On Evolve - The next Festive card you play this turn costs 2 less.
import { defineCard, onEvolve } from "../helpers";
import { festive } from "./shared";

export default defineCard({
  nextPlay: { festive: (g, card) => festive(g, card) },
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.nextPlayCostsLess("festive", 2);
      },
    }),
  ],
});
