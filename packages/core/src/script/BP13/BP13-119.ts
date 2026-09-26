// BP13-119 Retracing the Past — Neutral spell, 1. 傭兵.
// Select a follower on your field. Give it "{[lastwords]} Give your leader {[defense]}+2. Draw a card" for
// the rest of this turn. (Given twice, it triggers twice — ruling.)
import { defineCard, spell } from "../helpers";
import { yourFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [yourFollower()],
      *resolve(fx) {
        yield* fx.grant(fx.targets[0]![0]!, "lastWordsLeaderDraw", "endOfTurn");
      },
    }),
  ],
});
