// BP15-027 Supersonic Breakthrough — Swordcraft spell, 1. 兵士・超克.
// Choose 1. (1) Search your deck for a follower with "Ralmia" in its name, reveal it, add it to your hand, then
// shuffle. (2) {[cost04]}: Search your deck for up to 2 differently named followers with "Ralmia" in their names,
// summon them, then shuffle. (The option's cost is asked as it resolves, CR 10.4.7.5.)
import { playPointsCost } from "../costs";
import { defineCard, spell } from "../helpers";
import { and, isFollower, nameIncludes } from "../targets";

const ralmia = and(isFollower, nameIncludes("Ralmia"));

export default defineCard({
  abilities: [
    spell({
      modes: [
        {
          id: "hand",
          label: "(1) A Ralmia follower to your hand",
          *resolve(fx) {
            yield* fx.search((id) => ralmia(fx.game, id));
          },
        },
        {
          id: "summon",
          label: "(2) (4): Up to 2 Ralmia followers with different names onto your field",
          cost: playPointsCost(4),
          *resolve(fx) {
            yield* fx.search((id) => ralmia(fx.game, id), { max: 2, distinctNames: true, to: "field" });
          },
        },
      ],
    }),
  ],
});
