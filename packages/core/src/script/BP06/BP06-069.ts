// BP06-069 Dragonblader (Evolved) — Dragoncraft follower, 6/6. 竜使い.
// On Evolve: Select a card in an EX area and banish it.
import { defineCard, onEvolve } from "../helpers";
import { inAnyExArea } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [inAnyExArea()],
      *resolve(fx) {
        yield* fx.banish(fx.targets[0] ?? []);
      },
    }),
  ],
});
