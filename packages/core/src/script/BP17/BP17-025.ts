// BP17-025 Sunny Day Encounter — Swordcraft spell, 3. 自然・獣・プリンセス.
// Choose 1. (1) Search your deck for a Natura follower that costs 3 or less, summon it, then shuffle. (2) {[cost03]}:
// Search your deck for a Natura follower that costs 6 or less, summon it, then shuffle. (元のコスト; the option's cost is
// asked as it resolves, CR 10.4.7.5.)
import { playPointsCost } from "../costs";
import { defineCard, spell } from "../helpers";
import { costAtMost, isFollower } from "../targets";
import { natura } from "./shared";

export default defineCard({
  abilities: [
    spell({
      modes: [
        {
          id: "small",
          label: "(1) A Natura follower (3 or less) from your deck",
          *resolve(fx) {
            yield* fx.search((id) => isFollower(fx.game, id) && natura(fx.game, id) && costAtMost(3)(fx.game, id), { to: "field" });
          },
        },
        {
          id: "big",
          label: "(2) (3): A Natura follower (6 or less) from your deck",
          cost: playPointsCost(3),
          *resolve(fx) {
            yield* fx.search((id) => isFollower(fx.game, id) && natura(fx.game, id) && costAtMost(6)(fx.game, id), { to: "field" });
          },
        },
      ],
    }),
  ],
});
