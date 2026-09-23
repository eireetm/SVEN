// BP01-149 Guardian Sun — Havencraft amulet, 1.
// {[fanfare]} Select a follower on your field and give it Ward.
// {[act]}{[cost02]}, {[engage]}, put this card into its owner's cemetery: Select a follower with
// Ward on your field and give it +2/+2.
import { activated, defineCard, fanfare } from "../helpers";
import { yourFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      targets: [yourFollower()],
      *resolve(fx) {
        yield* fx.giveKeyword(fx.targets[0]![0]!, "ward");
      },
    }),
    activated(
      { playPoints: 2, engageSelf: true, burySelf: true },
      {
        targets: [yourFollower({ filter: (g, id) => g.hasKeyword(id, "ward") })],
        *resolve(fx) {
          yield* fx.giveStats(fx.targets[0]![0]!, 2, 2);
        },
      },
    ),
  ],
});
