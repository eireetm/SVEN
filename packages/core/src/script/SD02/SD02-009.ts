// SD02-009 Fencer — Swordcraft follower, 3, 3/3. 指揮官・貴族.
// {[fanfare]} Select another follower on your field and give it {[attack]}+1/{[defense]}+1.
import { defineCard, fanfare } from "../helpers";
import { anotherYourFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [anotherYourFollower()],
      *resolve(fx) {
        yield* fx.giveStats(fx.targets[0]![0]!, 1, 1);
      },
    }),
  ],
});
