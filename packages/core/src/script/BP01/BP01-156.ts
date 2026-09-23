// BP01-156 Urd (Evolved) — 3/3.
// On Evolve: Select a card in an opponent's EX area and banish it. (Aura does not protect in the
// EX area — ruling.)
import { defineCard, onEvolve } from "../helpers";
import { inOpponentZone } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [inOpponentZone("ex")],
      *resolve(fx) {
        yield* fx.banish(fx.targets[0]!);
      },
    }),
  ],
});
