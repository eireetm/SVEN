// ECP02-020 Mayu Sakuma [Love-Laden Gift] (Evolved) — 4/4.
// On Evolve - Select an enemy follower on the field and deal it damage equal to the number of cards in its controller's hand.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        const g = fx.game;
        const target = fx.targets[0]![0]!;
        yield* fx.dealDamage(target, g.cards(g.controller(target), "hand").length);
      },
    }),
  ],
});
