// BP17-080 Steeled Hopes — Abysscraft spell, 1. 機械・魔界.
// Choose 1. (1) Search your deck for a Machina follower, reveal it, add it to your hand, then shuffle. (2) {[cost06]}:
// Search your deck for a Machina follower that costs 4 or less, a Machina follower that costs 3 or less, and a Machina
// follower that costs 2 or less, summon them, then shuffle.
// ((2): one card for each cost, any of them may be left out — ruling. The option's cost is asked as it resolves, CR
// 10.4.7.5. Original cost, 元のコスト.)
import type { CardId } from "../../model/ids";
import { playPointsCost } from "../costs";
import { defineCard, spell } from "../helpers";
import { costAtMost, isFollower } from "../targets";
import { machina } from "./shared";

export default defineCard({
  abilities: [
    spell({
      modes: [
        {
          id: "search",
          label: "(1) A Machina follower from your deck into your hand",
          *resolve(fx) {
            yield* fx.search((id) => isFollower(fx.game, id) && machina(fx.game, id));
          },
        },
        {
          id: "summon",
          label: "(2) (6): Machina followers costing 4, 3 and 2 or less from your deck onto the field",
          cost: playPointsCost(6),
          *resolve(fx) {
            const g = fx.game;
            const upTo = (n: number) => (id: CardId) => isFollower(g, id) && machina(g, id) && costAtMost(n)(g, id);
            yield* fx.searchEach([upTo(4), upTo(3), upTo(2)], { to: "field" });
          },
        },
      ],
    }),
  ],
});
