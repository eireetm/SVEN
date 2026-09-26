// BP13-029 Cat Admiral — Swordcraft follower, 1, 2/2. 指揮官・獣.
// {[fanfare]} {[cost03]} Summon a Steelclad Knight and Shield Guardian token. (With room for one, its
// controller chooses which — ruling.)
// During your turn, whenever a {[swordcraft]} token follower is put onto your field, select an enemy
// follower on the field and deal it 1 damage.
import { defineCard, fanfare, whenFollowerEntersYourField } from "../helpers";
import { playPointsCost } from "../costs";
import { and, enemyFollower, isClass, isToken } from "../targets";
import { yourTurn } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      cost: playPointsCost(3),
      *resolve(fx) {
        yield* fx.summon(["Steelclad Knight", "Shield Guardian"]);
      },
    }),
    whenFollowerEntersYourField(
      {
        triggerIf: yourTurn,
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 1);
        },
      },
      { filter: and(isToken, isClass("Swordcraft")) },
    ),
  ],
});
