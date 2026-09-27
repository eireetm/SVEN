// CP02-046 Sarina Matsumoto — Runecraft follower, 3, 1/5. デレマス・クール.
// Whenever you play a spell, select an enemy follower on the field and deal it 2 damage. (Each copy triggers; a spell played in
// a quick timing of the opponent's turn triggers it too — rulings.)
import { defineCard, whenYouPlay } from "../helpers";
import { enemyFollower, isSpell } from "../targets";

export default defineCard({
  abilities: [
    whenYouPlay(
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 2);
        },
      },
      isSpell,
    ),
  ],
});
