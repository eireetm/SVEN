// BP11-T03 Dutiful Steed — Neutral amulet token, 1. 荒野・乗物・獣.
// Activate Bury this card: Select a follower on your field and, if it's a Wasteland follower, give it
// {[attack]}+1/{[defense]}+1. (Any follower can be selected — ruling.)
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
          if (wasteland(fx.game, target)) yield* fx.giveStats(target, 1, 1);
        },
      },
    ),
  ],
});
