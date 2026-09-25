// BP09-016 Substitution — Forestcraft spell, 2. 人形. Quick.
// Select an enemy follower that costs 3 or less on the field. Return it to its owner's hand and put a
// Puppet token into your EX area. (元のコスト; an evolved follower has its base card's cost. Without
// a target it can't be played — rulings. A token returned to hand is removed, CR 9.1.4.)
import { defineCard, spell } from "../helpers";
import { costAtMost, enemyFollower } from "../targets";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyFollower({ filter: costAtMost(3) })],
      *resolve(fx) {
        yield* fx.returnToHand(fx.targets[0]!);
        yield* fx.tokensToEx(["Puppet"]);
      },
    }),
  ],
});
