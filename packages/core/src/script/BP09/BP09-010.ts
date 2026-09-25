// BP09-010 Owl Man — Forestcraft follower, 1, 2/1. 狩人・獣.
// {[fanfare]} Select another Beast follower on your field and give it {[attack]}+1/{[defense]}+1.
import { defineCard, fanfare } from "../helpers";
import { anotherYourFollower } from "../targets";
import { beastFollower } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      targets: [anotherYourFollower({ filter: beastFollower })],
      *resolve(fx) {
        yield* fx.giveStats(fx.targets[0]![0]!, 1, 1);
      },
    }),
  ],
});
