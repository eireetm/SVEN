// CP03-081 Flame of Hope, Aermo — Dragoncraft follower, 1, 2/2. ヴァンガード・かげろう.
// {[fanfare]} Select an enemy follower on the field and, if Overflow is active for you, deal it 2 damage.
// Once on each of your turns, when an enemy follower is put from the field into the cemetery, draw a card, then discard a card.
// (A token counts — ruling.)
import { defineCard, fanfare, whenEnemyFollowerToCemetery } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        if (fx.game.overflow(fx.controller)) yield* fx.dealDamage(fx.targets[0]![0]!, 2);
      },
    }),
    whenEnemyFollowerToCemetery(
      {
        oncePerTurn: true,
        *resolve(fx) {
          yield* fx.draw(1);
          yield* fx.discard(fx.controller, 1, 1);
        },
      },
      { onlyYourTurn: true },
    ),
  ],
});
