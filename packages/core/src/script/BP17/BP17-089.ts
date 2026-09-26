// BP17-089 Soul Commander — Abysscraft follower, 5, 2/4. 死霊術師.
// {[fanfare]} Select a follower in your cemetery that costs 2 or less and summon it. (Original cost, 元のコスト.)
// Whenever a non-{[abysscraft]} follower is put onto your field, select an enemy follower on the field and deal it 3
// damage. (On the opponent's turn too — ruling.)
import { defineCard, fanfare, whenFollowerEntersYourField } from "../helpers";
import { and, costAtMost, enemyFollower, inYourZone, isClass, isFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [inYourZone("cemetery", { filter: and(isFollower, costAtMost(2)) })],
      *resolve(fx) {
        yield* fx.putOntoField(fx.targets[0]!);
      },
    }),
    whenFollowerEntersYourField(
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 3);
        },
      },
      { filter: (g, id) => !isClass("Abysscraft")(g, id) },
    ),
  ],
});
