// SD02-006 White General — Swordcraft follower, 4, 5/3. 指揮官.
// Rush.
// Strike: Select another follower on your field and give it {[attack]}+2.
import { defineCard, strike } from "../helpers";
import { anotherYourFollower } from "../targets";

export default defineCard({
  keywords: ["rush"],
  abilities: [
    strike({
      targets: [anotherYourFollower()],
      *resolve(fx) {
        yield* fx.giveStats(fx.targets[0]![0]!, 2, 0);
      },
    }),
  ],
});
