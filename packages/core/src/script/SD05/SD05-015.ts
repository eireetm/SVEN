// SD05-015 Undying Resentment — Abysscraft spell, 2. 死者. {[quick]}
// Select an enemy follower on the field and deal it 3 damage. Put the top card of your deck into your cemetery. (Not playable
// without a follower to select; playable with an empty deck — rulings.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 3);
        yield* fx.mill(1);
      },
    }),
  ],
});
