// BP07-009 Blossom Spirit (Evolved) — 3/4.
// On Evolve: Select an enemy follower on the field and deal it 2 damage. If there at least 3 cards
// in your EX area, deal 4 damage instead.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, fx.game.cards(fx.controller, "ex").length >= 3 ? 4 : 2);
      },
    }),
  ],
});
