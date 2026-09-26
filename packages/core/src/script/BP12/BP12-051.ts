// BP12-051 Mystic Absorption — Runecraft spell, 2. 魔法使い.
// Select an enemy follower on the field. Deal it 4 damage and, if there are at least 2 Mage followers on
// your field, give your leader {[defense]}+2. (Not playable without a target — ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { mageFollowersOnField } from "./shared";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
        if (mageFollowersOnField(fx.game, fx.controller) >= 2) yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
  ],
});
