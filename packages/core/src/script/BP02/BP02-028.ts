// BP02-028 Whole-Souled Swing — Swordcraft spell, 2. {[quick]}
// Select an enemy follower on the field. Deal it 3 damage and put a Knight token into your EX area.
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
        yield* fx.tokensToEx(["Knight"]);
      },
    }),
  ],
});
