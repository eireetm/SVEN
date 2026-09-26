// BP13-113 Managrocer (Evolved) — Neutral follower, 5/5. 商人.
// On Evolve - Select an enemy follower on the field and deal it damage equal to the number of cards in your
// hand.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, fx.game.cards(fx.controller, "hand").length);
      },
    }),
  ],
});
