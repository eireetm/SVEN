// BP01-050 Onslaught — Swordcraft spell, 3.
// Select an enemy follower on the field. Deal it 5 damage and put a Knight token into your EX
// area. (Needs a target; with a full EX area no Knight — rulings.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 5);
        yield* fx.tokensToEx(["Knight"]);
      },
    }),
  ],
});
