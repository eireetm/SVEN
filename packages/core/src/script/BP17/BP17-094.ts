// BP17-094 Yuwan, Dimensional Avenger (Evolved) — 3/3.
// On Evolve - Put an Ancient Artifact token into your EX area.
// On Super-Evolve - Select an enemy follower on the field. Deal 4 damage to it and 2 damage to its leader.
// (Super-evolving triggers both, in either order — rulings.)
import { defineCard, onEvolve, onSuperEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      *resolve(fx) {
        yield* fx.tokensToEx(["Ancient Artifact"]);
      },
    }),
    onSuperEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        const leader = fx.game.leader(fx.game.controller(target));
        yield* fx.dealDamage(target, 4);
        yield* fx.dealDamage(leader, 2);
      },
    }),
  ],
});
