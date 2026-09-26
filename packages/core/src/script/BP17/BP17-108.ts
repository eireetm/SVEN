// BP17-108 Mark Unleashed — Havencraft spell, 1. 信仰.
// This costs 1 less to play if there's a follower on your field with "Marlone" in its name.
// Select an enemy follower on the field and deal it damage equal to the number of Faith followers on your field.
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { faith } from "./shared";
import { marloneFollower } from "./shared-haven";

export default defineCard({
  playCost: (g, _self, p) => (g.followers(p).some((id) => marloneFollower(g, id)) ? -1 : 0),
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        const n = fx.game.followers(fx.controller).filter((id) => faith(fx.game, id)).length;
        if (n > 0) yield* fx.dealDamage(fx.targets[0]![0]!, n);
      },
    }),
  ],
});
