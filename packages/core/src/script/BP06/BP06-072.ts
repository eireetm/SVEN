// BP06-072 Flamewinged Might — Dragoncraft spell, 1. 不死鳥.
// Select a follower on your field and give it {[attack]}+2.
import { defineCard, spell } from "../helpers";
import { yourFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [yourFollower()],
      *resolve(fx) {
        yield* fx.giveStats(fx.targets[0]![0]!, 2, 0);
      },
    }),
  ],
});
