// BP05-117 Gliesaray — Neutral spell, 1. 絶傑.
// Select an enemy follower on the field and deal it 2 damage. If there is a Gilnelise, Omen of
// Craving on your field, banish the selected follower instead.
import { defineCard, spell } from "../helpers";
import { enemyFollower } from "../targets";
import { GILNELISE, onYourField } from "./shared";

export default defineCard({
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        if (onYourField(fx.game, fx.controller, GILNELISE)) yield* fx.banish([target]);
        else yield* fx.dealDamage(target, 2);
      },
    }),
  ],
});
