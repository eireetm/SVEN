// BP18-069 Ian, Dragon Buster (Evolved) — 5/5.
// Ward.
// On Evolve - Summon an Adelle, Jealous Dragon token.
import { defineCard, onEvolve } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.summon(["Adelle, Jealous Dragon"]);
      },
    }),
  ],
});
