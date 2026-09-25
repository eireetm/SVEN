// BP06-041 Hulking Giant — Runecraft follower, 5, 5/5. ゴーレム・禁忌.
// {[fanfare]}, Earth Rite: Select an enemy follower on the field and deal it 5 damage.
// {[lastwords]}, Earth Rite: Deal 3 damage to each enemy leader. (CR 13.3.3)
import { defineCard, fanfare, lastWords } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      earthRite: { mode: "required" },
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 5);
      },
    }),
    lastWords({
      earthRite: { mode: "required" },
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 3);
      },
    }),
  ],
});
