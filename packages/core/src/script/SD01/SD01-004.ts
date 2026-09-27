// SD01-004 Rose Gardener (Evolved) — 4/4.
// On Evolve: Select an enemy follower on the field and return it to its owner's hand. Combo (3): Draw a card.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.returnToHand(fx.targets[0]!);
        if (fx.game.combo(fx.controller, 3)) yield* fx.draw(1);
      },
    }),
  ],
});
