// BP06-077 Shuten-Doji (Evolved) — Abysscraft follower, 2/5. 妖怪.
// Storm. Bane.
// On Evolve: Select another Yokai follower on your field and give it Storm.
import { defineCard, onEvolve } from "../helpers";
import { anotherYourFollower, hasTrait } from "../targets";

export default defineCard({
  keywords: ["storm", "bane"],
  abilities: [
    onEvolve({
      targets: [anotherYourFollower({ filter: hasTrait("妖怪") })],
      *resolve(fx) {
        yield* fx.giveKeyword(fx.targets[0]![0]!, "storm");
      },
    }),
  ],
});
