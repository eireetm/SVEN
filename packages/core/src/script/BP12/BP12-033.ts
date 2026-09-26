// BP12-033 Splendid Fencer — Swordcraft follower, 3, 3/3. 指揮官・貴族.
// {[fanfare]} Select an Officer follower on your field and and give it {[attack]}+2.
import { defineCard, fanfare } from "../helpers";
import { hasTrait, yourFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [yourFollower({ filter: hasTrait("兵士") })],
      *resolve(fx) {
        yield* fx.giveStats(fx.targets[0]![0]!, 2, 0);
      },
    }),
  ],
});
