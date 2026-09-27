// CP01-018 Outrunning the Encroaching Heat — Swordcraft spell, 2. ウマ娘.
// Select a follower on your field. Give it Storm and, if it's an Umamusume follower, {[attack]}+1/{[defense]}+1.
import { defineCard, spell } from "../helpers";
import { yourFollower } from "../targets";
import { umamusume } from "./shared";

export default defineCard({
  abilities: [
    spell({
      targets: [yourFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        yield* fx.giveKeyword(target, "storm");
        if (umamusume(fx.game, target)) yield* fx.giveStats(target, 1, 1);
      },
    }),
  ],
});
