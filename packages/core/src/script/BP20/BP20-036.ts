// BP20-036 Shield Bash — Swordcraft spell, 1. 兵士.
// Select a follower on your field. Give it Assail and, for the rest of this turn, "This doesn't take damage." (Effects that
// aren't damage still work — ruling.)
import { defineCard, spell } from "../helpers";
import { yourFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [yourFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        yield* fx.giveKeyword(target, "assail");
        yield* fx.preventDamage(target, "all", "endOfTurn");
      },
    }),
  ],
});
