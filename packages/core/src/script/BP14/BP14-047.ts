// BP14-047 Chakram Wizard — Runecraft follower, 3, 2/2. 魔法使い.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} Select an enemy follower on the field and, if there's another Mage follower on your field, deal
// the selected follower 3 damage.
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { mage } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        if (fx.game.followers(fx.controller).some((id) => id !== fx.self && mage(fx.game, id))) yield* fx.dealDamage(fx.targets[0]![0]!, 3);
      },
    }),
  ],
});
