// ECP02-012 Rin Shibuya [Cinderella Girl] — Swordcraft follower, 2, 2/1. デレマス・クール.
// Storm.
// {[fanfare]}, Lesson (2): Select an enemy follower on the field and deal it damage equal to the number of Cool followers on your
// field. (Counted when it resolves; this follower counts.)
import { lesson } from "../costs";
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { cool, followersOnYourField } from "./shared";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    fanfare({
      cost: lesson(2),
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, followersOnYourField(fx.game, fx.controller, cool));
      },
    }),
  ],
});
