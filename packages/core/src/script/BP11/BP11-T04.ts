// BP11-T04 Bullet Bike — Neutral amulet token, 1. 荒野・乗物.
// Activate Bury this card: Select a follower on your field. Give it Rush and, if it's a Wasteland
// follower, give it {[attack]}+1.
import { activated, defineCard } from "../helpers";
import { yourFollower } from "../targets";
import { wasteland } from "./shared";

export default defineCard({
  abilities: [
    activated(
      { burySelf: true },
      {
        targets: [yourFollower()],
        *resolve(fx) {
          const target = fx.targets[0]![0]!;
          yield* fx.giveKeyword(target, "rush");
          if (wasteland(fx.game, target)) yield* fx.giveStats(target, 1, 0);
        },
      },
    ),
  ],
});
