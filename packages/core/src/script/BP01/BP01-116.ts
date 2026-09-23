// BP01-116 Soul Conversion — Abysscraft spell, 1. {[quick]}
// Select a follower on your field. Destroy it and draw 2 cards.
import { defineCard, spell } from "../helpers";
import { yourFollower } from "../targets";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [yourFollower()],
      *resolve(fx) {
        yield* fx.destroy(fx.targets[0]!);
        yield* fx.draw(2);
      },
    }),
  ],
});
