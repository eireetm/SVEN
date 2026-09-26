// BP08-016 Knower of History — Forestcraft follower, 4, 3/3. 超克.
// {[fanfare]} Summon an Ancient Artifact token.
// Whenever a token follower is put onto your field, select an enemy follower on the field and deal
// it 2 damage. (Also during the opponent's turn — ruling.)
import { defineCard, fanfare, whenFollowerEntersYourField } from "../helpers";
import { enemyFollower, isToken } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.summon(["Ancient Artifact"]);
      },
    }),
    whenFollowerEntersYourField(
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 2);
        },
      },
      { filter: isToken },
    ),
  ],
});
