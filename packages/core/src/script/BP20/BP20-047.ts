// BP20-047 Congregant of Truth (Evolved) — 4/4.
// On Evolve - Select an enemy follower on the field and deal it 3 damage. Draw a card, then discard a card. (Without a target,
// none of it — ruling.)
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
