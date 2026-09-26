// BP02-058 Polyphonic Roar — Dragoncraft amulet, 5.
// Once on each of your turns, when a Dragon token is put onto your field, select an enemy leader
// or enemy follower on the field and deal it 5 damage. (Once per turn per card — ruling;
// CR 10.7.2.2.)
import { defineCard, whenFollowerEntersYourField } from "../helpers";
import { and, enemyLeaderOrFollower, isToken, named } from "../targets";

export default defineCard({
  abilities: [
    whenFollowerEntersYourField(
      {
        oncePerTurn: true,
        triggerIf: (g, c) => g.activePlayer === c,
        targets: [enemyLeaderOrFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 5);
        },
      },
      { filter: and(isToken, named("Dragon")) },
    ),
  ],
});
