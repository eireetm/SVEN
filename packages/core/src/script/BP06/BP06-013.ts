// BP06-013 Crossbow Sniper — Forestcraft follower, 1, 1/1. 狩人.
// {[fanfare]} Discard a Hunter card: Select an enemy leader or enemy follower on the field. Deal it
// 1 damage and draw a card.
import { defineCard, fanfare } from "../helpers";
import { discardA } from "../costs";
import { enemyLeaderOrFollower, hasTrait } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      cost: discardA(hasTrait("狩人")),
      targets: [enemyLeaderOrFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 1);
        yield* fx.draw(1);
      },
    }),
  ],
});
