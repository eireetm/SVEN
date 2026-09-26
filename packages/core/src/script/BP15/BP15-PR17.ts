// BP15-PR17 Great Testimony — Neutral spell token, 0. 絶傑.
// Select an enemy follower on the field. Destroy it and, if there's a Mjerrabaine, Great One on your field, deal 2
// damage to its leader.
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { onYourField } from "./shared";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        const leader = fx.game.leader(fx.game.controller(target));
        yield* fx.destroy([target]);
        if (onYourField(fx.game, fx.controller, "Mjerrabaine, Great One")) yield* fx.dealDamage(leader, 2);
      },
    }),
  ],
});
