// BP06-017 Synchronized Slash — Forestcraft spell, 1. 狩人.
// {[engage]} 2 Hunter followers on your field: Select an enemy follower on the field and deal it 4
// damage.
// The target is needed to play it; engaging the followers is optional, done while it resolves, and
// without it nothing happens (rulings, CR 10.4.7.5).
import { defineCard, spell } from "../helpers";
import { enemyFollower, hasTrait } from "../targets";
import { engageYourFollowers } from "./shared";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        if (yield* fx.optionalCost(engageYourFollowers(2, hasTrait("狩人")))) yield* fx.dealDamage(fx.targets[0]![0]!, 4);
      },
    }),
  ],
});
