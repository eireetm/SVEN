// CP02-045 Precocious Little Devil — Runecraft spell, 1. デレマス・クール.
// {[quick]}
// Select an enemy follower on the field and deal it 2 damage. If there are at least 3 iM@S CG followers on your field, deal 3
// damage instead.
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { followersOnYourField, imas } from "./shared";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, followersOnYourField(fx.game, fx.controller, imas) >= 3 ? 3 : 2);
      },
    }),
  ],
});
