// BP04-037 Armor of the Stars — Swordcraft spell, 2. 星神.
// Select a follower on your field. Give it +1/+2 and Aura.
import { defineCard, spell } from "../helpers";
import { yourFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [yourFollower()],
      *resolve(fx) {
        const id = fx.targets[0]![0]!;
        yield* fx.giveStats(id, 1, 2);
        yield* fx.giveKeyword(id, "aura");
      },
    }),
  ],
});
