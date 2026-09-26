// BP12-045 Arcane Item Shop — Runecraft amulet, 7. 魔法使い・錬金術師.
// {[fanfare]} If there are no followers in your cemetery, recover 6 play points.
// Whenever you play a {[runecraft]} spell, select an enemy leader or enemy follower on the field and deal
// it 2 damage. (Also during the opponent's turn; playing an activated ability is not playing a spell —
// rulings.)
import { defineCard, fanfare, whenYouPlay } from "../helpers";
import { and, enemyLeaderOrFollower, isClass, isFollower, isSpell } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      condition: (g, p) => !g.cards(p, "cemetery").some((id) => isFollower(g, id)),
      *resolve(fx) {
        yield* fx.recoverPlayPoints(6);
      },
    }),
    whenYouPlay(
      {
        targets: [enemyLeaderOrFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 2);
        },
      },
      and(isSpell, isClass("Runecraft")),
    ),
  ],
});
