// BP10-053 Magical Augmentation — Runecraft spell, 1. 魔法使い.
// Select an enemy follower on the field and deal it 2 damage. Earth Rite (2): Deal 4 damage instead
// and draw a card. (Not playable without a target; Earth Rite (2) removes 2 Stack counters and is
// optional — rulings, CR 13.3.3.2.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      earthRite: { mode: "optional", count: 2 },
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, fx.earthRitePaid ? 4 : 2);
        if (fx.earthRitePaid) yield* fx.draw(1);
      },
    }),
  ],
});
