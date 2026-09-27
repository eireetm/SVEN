// CP01-084 Tazuna Hayakawa — Neutral follower, 4, 3/5. トレセン学園.
// Ward.
// {[fanfare]} Select an Umamusume follower on your field and give it {[attack]}+1/{[defense]}+2.
import { defineCard, fanfare } from "../helpers";
import { yourFollower } from "../targets";
import { umamusume } from "./shared";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      targets: [yourFollower({ filter: umamusume })],
      *resolve(fx) {
        yield* fx.giveStats(fx.targets[0]![0]!, 1, 2);
      },
    }),
  ],
});
