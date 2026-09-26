// BP11-051 Scorching Blast — Runecraft spell, 3. 魔法使い.
// {[quick]}
// Select an enemy follower on the field and deal it 5 damage. If there are at least 2 Mage followers on
// your field, deal 2 damage to its leader.
import { defineCard, spell } from "../helpers";
import { enemyFollower, hasTrait } from "../targets";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        const leader = fx.game.leader(fx.game.controller(target));
        yield* fx.dealDamage(target, 5);
        if (fx.game.followers(fx.controller).filter((id) => hasTrait("魔法使い")(fx.game, id)).length >= 2) yield* fx.dealDamage(leader, 2);
      },
    }),
  ],
});
