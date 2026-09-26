// BP08-088 Godsworn Alexiel (Evolved) — Havencraft follower, 5/5. 信仰・光輝.
// Ward. On Evolve: select an enemy follower and deal it and its leader 2 damage per amulet on your
// field. Without a selectable follower the ability cannot be played (ruling; CR 10.6.2.3.3).
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower, isAmulet } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        const leader = fx.game.leader(fx.game.controller(target));
        const x = fx.game.cards(fx.controller, "field").filter((id) => isAmulet(fx.game, id)).length * 2;
        yield* fx.dealDamages([{ target, amount: x }, { target: leader, amount: x }]);
      },
    }),
  ],
});
