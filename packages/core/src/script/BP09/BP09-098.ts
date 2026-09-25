// BP09-098 Lycaon (Evolved) — Havencraft follower, 6/6. 狂信・獣.
// On Evolve - Discard an amulet: Select an enemy follower on the field. Deal it 5 damage and draw a
// card. (Without a target it isn't played and nothing is discarded — ruling.)
import { discardA } from "../costs";
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower, isAmulet } from "../targets";

export default defineCard({
  abilities: [
    onEvolve(
    {
      cost: discardA(isAmulet),
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 5);
        yield* fx.draw(1);
      },
    },
    ),
  ],
});
