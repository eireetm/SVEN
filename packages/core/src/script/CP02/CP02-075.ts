// CP02-075 Whispers of a Dream — Abysscraft spell, 2. デレマス・クール.
// {[quick]}
// Select an enemy follower that costs 3 or less on the field. Destroy it and bury the top card of your deck. (元のコスト: an
// evolved follower's is its base card's — ruling.)
import { defineCard, spell } from "../helpers";
import { costAtMost, enemyFollower } from "../targets";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyFollower({ filter: costAtMost(3) })],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
        yield* fx.mill(1);
      },
    }),
  ],
});
