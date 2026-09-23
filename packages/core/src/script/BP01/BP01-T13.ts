// BP01-T13 Coco (Coco, Infernal Left Paw) — Abysscraft spell token, 0.
// Select a follower on your field and give it +2 attack.
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
