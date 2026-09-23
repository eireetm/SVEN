// BP01-049 Forge Weaponry — Swordcraft spell, 2. {[quick]}
// Select a follower on your field. Give it +1/+1 and draw a card. (Needs a follower — ruling.)
import { defineCard, spell } from "../helpers";
import { yourFollower } from "../targets";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [yourFollower()],
      *resolve(fx) {
        yield* fx.giveStats(fx.targets[0]![0]!, 1, 1);
        yield* fx.draw(1);
      },
    }),
  ],
});
