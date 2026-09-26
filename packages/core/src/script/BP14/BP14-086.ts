// BP14-086 Creeping Malice — Abysscraft spell, 2. 魔界.
// {[quick]}
// Select an enemy follower on the field. Deal 5 damage to it and 3 damage to your leader. (Not playable without
// a target — ruling.)
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  keywords: ["quick"],
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamages([
          { target: fx.targets[0]![0]!, amount: 5 },
          { target: fx.game.leader(fx.controller), amount: 3 },
        ]);
      },
    }),
  ],
});
