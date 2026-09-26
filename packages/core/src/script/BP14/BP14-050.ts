// BP14-050 Earthen Fist — Runecraft spell, 3. 魔法使い.
// {[quick]}
// Select an enemy follower on the field and deal it 5 damage. Earth Rite: Deal 2 damage to its leader. (An
// optional additional cost, CR 13.3.3.2.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      earthRite: { mode: "optional" },
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        const leader = fx.game.leader(fx.game.controller(target));
        yield* fx.dealDamage(target, 5);
        if (fx.earthRitePaid) yield* fx.dealDamage(leader, 2);
      },
    }),
  ],
});
