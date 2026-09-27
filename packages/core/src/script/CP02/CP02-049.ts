// CP02-049 Sae Kobayakawa — Runecraft follower, 1, 1/2. デレマス・キュート.
// {[fanfare]} Select another iM@S CG follower on your field and give it {[attack]}+1/{[defense]}+1.
import { defineCard, fanfare } from "../helpers";
import { anotherYourFollower } from "../targets";
import { imas } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      targets: [anotherYourFollower({ filter: imas })],
      *resolve(fx) {
        yield* fx.giveStats(fx.targets[0]![0]!, 1, 1);
      },
    }),
  ],
});
