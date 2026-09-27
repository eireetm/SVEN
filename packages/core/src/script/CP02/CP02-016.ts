// CP02-016 Otoha Umeki — Forestcraft follower, 2, 1/3. デレマス・クール.
// Whenever you play a card, select an enemy follower on the field and deal it 1 damage.
// (Cards played from the hand, EX area or cemetery, by an effect too; not abilities; not this card itself, which is not on
// the field when it is played — rulings.)
import { defineCard, whenYouPlay } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    whenYouPlay(
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 1);
        },
      },
      () => true,
    ),
  ],
});
