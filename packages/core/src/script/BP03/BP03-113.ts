// BP03-113 Garuel, Seraphic Leo (Evolved) — Neutral, 3/4.
// On Evolve: Select another Neutral follower on your field and return it to its owner's hand.
import { defineCard, onEvolve } from "../helpers";
import { anotherYourFollower, isClass } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [anotherYourFollower({ filter: isClass("Neutral") })],
      *resolve(fx) {
        yield* fx.returnToHand(fx.targets[0] ?? []);
      },
    }),
  ],
});
