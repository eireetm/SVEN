// CP03-067 Blazing Flare Dragon (Evolved) — 6/6. (Evolved from CP03-066, which names it.)
// Twin Drive.
// On Evolve - Select an enemy follower on the field. Deal 5 damage to it and 3 damage to its leader.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["twinDrive"],
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        const leader = fx.game.leader(fx.game.controller(target));
        yield* fx.dealDamage(target, 5);
        yield* fx.dealDamage(leader, 3);
      },
    }),
  ],
});
