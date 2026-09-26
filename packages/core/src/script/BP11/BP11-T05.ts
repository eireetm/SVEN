// BP11-T05 Arcane Personnel Carrier — Neutral amulet token, 1. 荒野・乗物.
// Activate Bury this card: Select a follower on your field. Give it Ward and, if it's a Wasteland
// follower, give it {[defense]}+1.
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
          yield* fx.giveKeyword(target, "ward");
          if (wasteland(fx.game, target)) yield* fx.giveStats(target, 0, 1);
        },
      },
    ),
  ],
});
