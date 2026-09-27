// CP02-044 Frederica Miyamoto — Runecraft follower, 2, 2/2. デレマス・キュート.
// Once per turn, when you play a card that originally costs 5 or more, select an enemy leader or enemy follower on the field.
// Deal it 3 damage and draw a card. (Cost changes don't change the original cost; each copy triggers; on each turn,
// the opponent's too — rulings; CR 5.24.1, 10.7.2.2.)
import { defineCard, whenYouPlay } from "../helpers";
import { enemyLeaderOrFollower } from "../targets";

export default defineCard({
  abilities: [
    whenYouPlay(
      {
        oncePerTurn: true,
        targets: [enemyLeaderOrFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 3);
          yield* fx.draw(1);
        },
      },
      (g, id) => (g.info(id).cost ?? 0) >= 5,
    ),
  ],
});
