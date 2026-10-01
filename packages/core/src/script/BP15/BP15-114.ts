// BP15-114 Gilnelise, Ravenous Craving (Evolved) — Neutral follower, 3/3. 絶傑.
// While your leader's defense is 10 or less, this has Drain.
// On Evolve - Choose 1. (1) Select another follower on the field and give it {[attack]}+2/{[defense]}-2. (2) Put a
// Ravenous Sweetness token into your EX area. ((1) needs its target — ruling.)
// The scraped English (effect_en) says {[attack]}-2/{[defense]}-2, but the official English text, the Japanese
// (攻撃力+2/体力-2) and the Chinese all say +2/-2, so this follows them.
import { defineCard, onEvolve } from "../helpers";
import { anotherFollower } from "../targets";
import { gilneliseDrain } from "./shared-neutral";

export default defineCard({
  selfKeywords: gilneliseDrain,
  abilities: [
    onEvolve({
      modes: [
        {
          id: "stats",
          label: "(1) Another follower: +2/-2",
          targets: [anotherFollower()],
          *resolve(fx) {
            yield* fx.giveStats(fx.targets[0]![0]!, 2, -2);
          },
        },
        {
          id: "sweetness",
          label: "(2) A Ravenous Sweetness into your EX area",
          *resolve(fx) {
            yield* fx.tokensToEx(["Ravenous Sweetness"]);
          },
        },
      ],
    }),
  ],
});
