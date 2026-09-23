// BP01-151 Gabriel — Neutral follower, 6, 4/3.
// Ward. // {[fanfare]} Select another follower on your field. Give it +4/+3 and Assail.
import { defineCard, fanfare } from "../helpers";
import { anotherYourFollower } from "../targets";

export default defineCard({
  keywords: ["ward"],
  abilities: [
    fanfare({
      targets: [anotherYourFollower()],
      *resolve(fx) {
        const t = fx.targets[0]![0]!;
        yield* fx.giveStats(t, 4, 3);
        yield* fx.giveKeyword(t, "assail");
      },
    }),
  ],
});
