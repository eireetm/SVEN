// BP08-116 High Enchantress (Evolved) — Neutral follower, 5/4. 傭兵.
// On Evolve: deal an enemy follower damage equal to the number of cards in your EX area.
// CR 4.8.3, 5.14, 12.6.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) { yield* fx.dealDamage(fx.targets[0]![0]!, fx.game.cards(fx.controller, "ex").length); },
    }),
  ],
});
