// SD05-004 Playful Necromancer (Evolved) — 4/4.
// On Evolve: Summon 3 Ghost tokens. (As many as fit — ruling, CR 4.4.4.2.)
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.summon(["Ghost", "Ghost", "Ghost"]);
      },
    }),
  ],
});
