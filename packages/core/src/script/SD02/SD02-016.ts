// SD02-016 Unbridled Fury — Swordcraft spell, 1. 兵士. {[quick]}
// Select an enemy follower on the field and deal it X damage. X equals the number of followers on your field. (Playable with no
// follower on your field — ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, fx.game.followers(fx.controller).length);
      },
    }),
  ],
});
