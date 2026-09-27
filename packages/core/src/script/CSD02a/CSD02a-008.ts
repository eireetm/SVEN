// CSD02a-008 Akiha Ikebukuro (Evolved) — 4/4.
// On Evolve - Discard a Cute card: Select an enemy follower on the field. Deal it 3 damage and draw a card. (Without a follower to
// select it isn't played: no discard, no draw — ruling.)
import { discardA } from "../costs";
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { cute } from "../CP02/shared";

export default defineCard({
  abilities: [
    onEvolve({
      cost: discardA(cute),
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
        yield* fx.draw(1);
      },
    }),
  ],
});
