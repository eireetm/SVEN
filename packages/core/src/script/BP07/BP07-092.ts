// BP07-092 Augmentation Bestowal — Havencraft spell, 2. 機械・信仰.
// Choose one of the following. (1) Banish 2 cards named Repair Mode from your EX area: Search your
// deck for a Machina follower that costs 3 or less, summon it, then shuffle your deck. (2) Banish 5
// cards named Repair Mode from your EX area: Search your deck for a Machina follower that costs 6 or
// less, summon it, then shuffle your deck.
// (元のコスト. The "[process]:" of the chosen option is asked for when it resolves; the option can be
// chosen without it — CR 10.4.7.5, BP03-117 ruling.)
import { banishFromYourEx } from "../costs";
import { defineCard, spell } from "../helpers";
import { and, costAtMost, isFollower, named } from "../targets";
import { REPAIR, machina } from "./shared";

export default defineCard({
  abilities: [
    spell({
      modes: [
        {
          id: "three",
          label: "(1) Banish 2 Repair Modes: summon a Machina follower costing 3 or less from your deck",
          cost: banishFromYourEx(named(REPAIR), 2),
          *resolve(fx) {
            yield* fx.search((id) => and(isFollower, machina, costAtMost(3))(fx.game, id), { to: "field" });
          },
        },
        {
          id: "six",
          label: "(2) Banish 5 Repair Modes: summon a Machina follower costing 6 or less from your deck",
          cost: banishFromYourEx(named(REPAIR), 5),
          *resolve(fx) {
            yield* fx.search((id) => and(isFollower, machina, costAtMost(6))(fx.game, id), { to: "field" });
          },
        },
      ],
    }),
  ],
});
