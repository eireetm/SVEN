// BP12-043 Chaos Wielder (Evolved) — Runecraft follower, 2/3. 魔法使い・禁忌.
// On Evolve - Select an enemy follower on the field. Deal it 2 damage and, if there are at least 5 Mage
// followers in your cemetery, draw a card. (Not played without a target — ruling.)
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { mageFollowersInCemetery } from "./shared";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 2);
        if (mageFollowersInCemetery(fx.game, fx.controller) >= 5) yield* fx.draw(1);
      },
    }),
  ],
});
