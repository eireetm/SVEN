// BP08-034 Godsent Stride — Swordcraft spell, 2. 兵士.
// Select your follower; give it +3/+2 and Rush. CR 10.6.2.3, 10.9.2, 12.10.
import { defineCard, spell } from "../helpers";
import { yourFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [yourFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        yield* fx.giveStats(target, 3, 2);
        yield* fx.giveKeyword(target, "rush");
      },
    }),
  ],
});
