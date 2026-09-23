// BP01-T01 Thorn Burst — Forestcraft spell token, 2.
// Select an enemy leader or enemy follower on the field. Deal it 3 damage and draw a card.
import { defineCard, spell } from "../helpers";
import { enemyLeaderOrFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyLeaderOrFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
        yield* fx.draw(1);
      },
    }),
  ],
});
