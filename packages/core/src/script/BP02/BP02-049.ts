// BP02-049 Witchbolt — Runecraft spell, 3.
// Select an enemy follower on the field. Deal it 5 damage and, if there is an evolved follower on
// your field, draw a card.
import { defineCard, spell } from "../helpers";
import { enemyFollower, isEvolved } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 5);
        if (fx.game.followers(fx.controller).some((id) => isEvolved(fx.game, id))) yield* fx.draw(1);
      },
    }),
  ],
});
