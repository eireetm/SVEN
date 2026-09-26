// BP14-048 Chakram Wizard (Evolved) — Runecraft follower, 3/3. 魔法使い.
// On Evolve - Select an enemy follower on the field. Deal it 3 damage, draw a card, then discard a card. (Not
// played without a target — ruling.)
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
        yield* fx.draw(1);
        yield* fx.discard(fx.controller, 1, 1);
      },
    }),
  ],
});
