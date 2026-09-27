// CP01-008 Systematic Squats — Forestcraft amulet, 2. ウマ娘.
// {[fanfare]} Draw a card.
// When this card leaves the field, select an Umamusume follower on your field and give it {[attack]}+1/{[defense]}+1.
import { defineCard, fanfare, whenThisLeavesField } from "../helpers";
import { yourFollower } from "../targets";
import { umamusume } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        yield* fx.draw(1);
      },
    }),
    whenThisLeavesField({
      targets: [yourFollower({ filter: umamusume })],
      *resolve(fx) {
        yield* fx.giveStats(fx.targets[0]![0]!, 1, 1);
      },
    }),
  ],
});
