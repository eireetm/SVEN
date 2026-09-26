// BP12-111 Goblin Warpack — Neutral spell, 2. ゴブリン.
// This card can only be played if there are at least 3 Goblinoid followers on your field.
// ----------
// Select an enemy follower on the field. Destroy it and deal 2 damage to its leader.
import { defineCard, spell } from "../helpers";
import { enemyFollower, hasTrait } from "../targets";

const goblinoid = hasTrait("ゴブリン");

export default defineCard({
  playableIf: (g, _self, player) => g.followers(player).filter((id) => goblinoid(g, id)).length >= 3,
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        const leader = fx.game.leader(fx.game.controller(target));
        yield* fx.destroy([target]);
        yield* fx.dealDamage(leader, 2);
      },
    }),
  ],
});
