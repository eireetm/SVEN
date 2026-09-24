// BP02-009 Crystalia Lily (Evolved) — 2/4.
// On Evolve: Select an enemy follower on the field and put it on the bottom of its owner's deck.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.putOnDeck(fx.targets[0]!, "bottom");
      },
    }),
  ],
});
