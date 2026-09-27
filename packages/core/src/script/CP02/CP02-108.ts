// CP02-108 Rookie Trainer — Neutral follower, 1, 2/2. デレマス.
// Activate {[engage]}: Select another iM@S CG follower on your field and give it {[attack]}+1.
import { activated, defineCard } from "../helpers";
import { anotherYourFollower } from "../targets";
import { imas } from "./shared";

export default defineCard({
  abilities: [
    activated(
      { engageSelf: true },
      {
        targets: [anotherYourFollower({ filter: imas })],
        *resolve(fx) {
          yield* fx.giveStats(fx.targets[0]![0]!, 1, 0);
        },
      },
    ),
  ],
});
